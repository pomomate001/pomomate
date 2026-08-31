/**
 * FriendService — handles friend list, friendship requests, and friend statistics.
 *
 * Implements M06 friends logic, connecting to Supabase and backend /api/friends.
 */
import { supabase } from '../auth/supabaseClient';
import { useFriendsStore, FriendSummary, FriendRequest } from '../../state/friendsStore';
import { logger } from '../../utils/logger';
import type { Tag } from '../../types';
import type { SuggestedUser } from '../../state/friendsStore';

export class FriendService {
  /** Fetch list of accepted friends and update the store. */
  async fetchFriends(userId: string): Promise<FriendSummary[]> {
    useFriendsStore.getState().setLoading(true);
    useFriendsStore.getState().setError(null);

    try {
      // 1. Query friendships where user is party A or B
      const { data: friendships, error: fErr } = await supabase
        .from('friendships')
        .select('user_a, user_b')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      if (fErr) {
        logger.warn('[FriendService] Failed to load friendships:', fErr.message);
        useFriendsStore.getState().setLoading(false);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        useFriendsStore.getState().setFriends([]);
        useFriendsStore.getState().setLoading(false);
        return [];
      }

      const friendIds = friendships.map((f) => (f.user_a === userId ? f.user_b : f.user_a));

      // 2. Fetch profiles
      const { data: profiles, error: pErr } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', friendIds);

      if (pErr) {
        logger.warn('[FriendService] Failed to load friend profiles:', pErr.message);
      }

      // 3. Assemble summaries
      const friendList: FriendSummary[] = (profiles ?? []).map((p: any) => ({
        userId: p.id,
        displayName: p.display_name ?? 'Kullanıcı',
        avatarUrl: p.avatar_url,
        totalWorkSeconds: 0,
        totalPomodoros: 0,
        streak: 0,
      }));

      useFriendsStore.getState().setFriends(friendList);
      useFriendsStore.getState().setLoading(false);
      return friendList;
    } catch (err: any) {
      logger.warn('[FriendService] fetchFriends error:', err);
      useFriendsStore.getState().setError(err.message ?? 'Arkadaşlar yüklenemedi');
      useFriendsStore.getState().setLoading(false);
      return [];
    }
  }

  /** Send a friend request to a user ID. */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<{ success: boolean; message: string }> {
    if (!toUserId || toUserId.trim().length === 0) {
      return { success: false, message: 'Geçersiz kullanıcı ID veya kodu.' };
    }

    const cleanToUserId = toUserId.trim();
    if (cleanToUserId === fromUserId) {
      return { success: false, message: 'Kendinize arkadaşlık isteği gönderemezsiniz.' };
    }

    try {
      // 1. Check if blocked
      const { data: blockData } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`and(blocker_id.eq.${fromUserId},blocked_id.eq.${cleanToUserId}),and(blocker_id.eq.${cleanToUserId},blocked_id.eq.${fromUserId})`)
        .limit(1);
      
      if (blockData && blockData.length > 0) {
        return { success: false, message: 'Bu kullanıcıyla etkileşime geçilemez.' };
      }

      // 2. Check request limit BEFORE sending
      const limitInfo = await this.checkRequestLimit(fromUserId, cleanToUserId);
      if (!limitInfo.canSend) {
        return { success: false, message: 'Bu kişiye en fazla 2 istek gönderebilirsiniz.' };
      }

      // Check if user exists
      const { data: targetUser, error: uErr } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', cleanToUserId)
        .single();

      if (uErr || !targetUser) {
        return { success: false, message: 'Bu koda sahip kullanıcı bulunamadı.' };
      }

      // Check if already friends
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_a.eq.${fromUserId},user_b.eq.${cleanToUserId}),and(user_a.eq.${cleanToUserId},user_b.eq.${fromUserId})`)
        .single();

      if (existingFriendship) {
        return { success: false, message: 'Zaten bu kullanıcıyla arkadaşsınız.' };
      }

      // Find existing request
      const { data: existingReq } = await supabase
        .from('friendship_requests')
        .select('id, status, request_count')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', cleanToUserId)
        .single();

      if (existingReq) {
        if (existingReq.status === 'pending') {
          return { success: false, message: 'Zaten bekleyen bir arkadaşlık isteğiniz var.' };
        }
        if (existingReq.status === 'accepted') {
          return { success: false, message: 'Zaten bu kullanıcıyla arkadaşsınız.' };
        }
        
        // If rejected, update status to pending and increment request_count
        if (existingReq.status === 'rejected') {
          const { error: updErr } = await supabase
            .from('friendship_requests')
            .update({ 
              status: 'pending', 
              request_count: (existingReq.request_count || 1) + 1 
            })
            .eq('id', existingReq.id);
            
          if (updErr) return { success: false, message: updErr.message };
          return { success: true, message: `${targetUser.display_name || 'Kullanıcıya'} arkadaşlık isteği gönderildi!` };
        }
      }

      // Send request
      const { error: reqErr } = await supabase
        .from('friendship_requests')
        .insert({
          from_user_id: fromUserId,
          to_user_id: cleanToUserId,
          status: 'pending',
          request_count: 1
        });

      if (reqErr) {
        if (reqErr.code === '23505') {
          return { success: false, message: 'Zaten bekleyen bir arkadaşlık isteğiniz var.' };
        }
        return { success: false, message: reqErr.message };
      }

      return { success: true, message: `${targetUser.display_name || 'Kullanıcıya'} arkadaşlık isteği gönderildi!` };
    } catch (err: any) {
      return { success: false, message: err.message ?? 'İstek gönderilemedi.' };
    }
  }

  /** Fetch incoming pending requests. */
  async fetchIncomingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friendship_requests')
        .select('id, from_user_id, status, created_at, users!friendship_requests_from_user_id_fkey(display_name, avatar_url)')
        .eq('to_user_id', userId)
        .eq('status', 'pending');

      if (error) {
        logger.warn('[FriendService] Incoming requests error:', error.message);
        return [];
      }

      const formatted: FriendRequest[] = (data ?? []).map((r: any) => ({
        id: r.id,
        fromUserId: r.from_user_id,
        fromDisplayName: r.users?.display_name ?? 'Kullanıcı',
        fromAvatarUrl: r.users?.avatar_url,
        status: r.status,
        createdAt: r.created_at,
      }));

      useFriendsStore.getState().setIncomingRequests(formatted);
      return formatted;
    } catch (err) {
      logger.warn('[FriendService] fetchIncomingRequests error:', err);
      return [];
    }
  }

  /** Accept a friendship request. */
  async acceptRequest(requestId: string, fromUserId: string, currentUserId: string): Promise<boolean> {
    try {
      // 1. Update request status
      const { error: updErr } = await supabase
        .from('friendship_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updErr) throw updErr;

      // 2. Insert friendship (ordered pair)
      const [a, b] = [fromUserId, currentUserId].sort();
      await supabase.from('friendships').insert({ user_a: a, user_b: b });

      // 3. Refresh friends and requests
      await this.fetchFriends(currentUserId);
      await this.fetchIncomingRequests(currentUserId);
      return true;
    } catch (err) {
      logger.warn('[FriendService] acceptRequest failed:', err);
      return false;
    }
  }

  /** Reject a friendship request. */
  async rejectRequest(requestId: string, currentUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendship_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      await this.fetchIncomingRequests(currentUserId);
      return true;
    } catch (err) {
      logger.warn('[FriendService] rejectRequest failed:', err);
      return false;
    }
  }

  /** Remove an existing friend. */
  async removeFriend(currentUserId: string, friendUserId: string): Promise<boolean> {
    try {
      const [a, b] = [currentUserId, friendUserId].sort();
      await supabase
        .from('friendships')
        .delete()
        .eq('user_a', a)
        .eq('user_b', b);

      await this.fetchFriends(currentUserId);
      return true;
    } catch (err) {
      logger.warn('[FriendService] removeFriend failed:', err);
      return false;
    }
  }

  /** Discover users in the same country, ranked by matching tags. */
  async discoverUsers(userId: string, limit: number = 20): Promise<SuggestedUser[]> {
    try {
      // 1. Get current user's country and tags
      const { data: currentUser } = await supabase
        .from('users')
        .select('country_code')
        .eq('id', userId)
        .single();

      if (!currentUser?.country_code) {
        logger.warn('[FriendService] User has no country_code set');
        return [];
      }

      const { data: myTagRows } = await supabase
        .from('user_tags')
        .select('tag_id')
        .eq('user_id', userId);

      const myTagIds = new Set((myTagRows ?? []).map((r: any) => r.tag_id));

      // 2. Get existing friends, blocked users, and pending requests
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_a, user_b')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      const friendIds = new Set(
        (friendships ?? []).map((f: any) => f.user_a === userId ? f.user_b : f.user_a)
      );

      const { data: blocks } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', userId);

      const blockedIds = new Set((blocks ?? []).map((b: any) => b.blocked_id));

      // Also get users who blocked us
      const { data: blockedBy } = await supabase
        .from('user_blocks')
        .select('blocker_id')
        .eq('blocked_id', userId);

      const blockedByIds = new Set((blockedBy ?? []).map((b: any) => b.blocker_id));

      // 3. Fetch candidates from same country
      const { data: candidates } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, country_code')
        .eq('country_code', currentUser.country_code)
        .neq('id', userId)
        .limit(200);

      if (!candidates || candidates.length === 0) return [];

      // 4. Filter out friends, blocked
      const filtered = candidates.filter((c: any) => 
        !friendIds.has(c.id) && !blockedIds.has(c.id) && !blockedByIds.has(c.id)
      );

      // 5. Get tags for all candidates
      const candidateIds = filtered.map((c: any) => c.id);
      const { data: candidateTags } = await supabase
        .from('user_tags')
        .select('user_id, tag_id, tags(id, slug, name_tr, name_en, category, icon)')
        .in('user_id', candidateIds);

      // Build tag map per user
      const tagMap = new Map<string, Tag[]>();
      for (const row of (candidateTags ?? [])) {
        const uid = (row as any).user_id;
        if (!tagMap.has(uid)) tagMap.set(uid, []);
        const t = (row as any).tags;
        if (t) {
          tagMap.get(uid)!.push({
            id: t.id,
            slug: t.slug,
            nameTr: t.name_tr,
            nameEn: t.name_en,
            category: t.category,
            icon: t.icon,
          });
        }
      }

      // 6. Score and rank
      const suggestions: SuggestedUser[] = filtered.map((c: any) => {
        const userTags = tagMap.get(c.id) ?? [];
        const matchCount = userTags.filter((t) => myTagIds.has(t.id)).length;
        return {
          userId: c.id,
          displayName: c.display_name ?? 'Kullanıcı',
          avatarUrl: c.avatar_url,
          countryCode: c.country_code,
          tags: userTags,
          matchingTagCount: matchCount,
        };
      });

      // Sort by matching tag count (desc), then shuffle within same score
      suggestions.sort((a, b) => {
        if (b.matchingTagCount !== a.matchingTagCount) {
          return b.matchingTagCount - a.matchingTagCount;
        }
        return Math.random() - 0.5;
      });

      const result = suggestions.slice(0, limit);
      useFriendsStore.getState().setSuggestedUsers(result);
      return result;
    } catch (err: any) {
      logger.warn('[FriendService] discoverUsers error:', err);
      return [];
    }
  }

  /** Block a user. Also removes friendship if exists. */
  async blockUser(blockerId: string, blockedId: string): Promise<boolean> {
    try {
      // Insert block
      const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: blockerId, blocked_id: blockedId });

      if (error) {
        logger.warn('[FriendService] blockUser error:', error.message);
        return false;
      }

      // Remove friendship if exists
      const [a, b] = [blockerId, blockedId].sort();
      await supabase
        .from('friendships')
        .delete()
        .eq('user_a', a)
        .eq('user_b', b);

      // Refresh
      await this.fetchFriends(blockerId);
      useFriendsStore.getState().addBlockedUserId(blockedId);
      return true;
    } catch (err: any) {
      logger.warn('[FriendService] blockUser error:', err);
      return false;
    }
  }

  /** Unblock a user. */
  async unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
    try {
      await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

      // Refresh blocked list
      await this.fetchBlockedUsers(blockerId);
      return true;
    } catch (err: any) {
      logger.warn('[FriendService] unblockUser error:', err);
      return false;
    }
  }

  /** Fetch list of blocked user IDs. */
  async fetchBlockedUsers(userId: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', userId);

      const ids = (data ?? []).map((b: any) => b.blocked_id);
      useFriendsStore.getState().setBlockedUserIds(ids);
      return ids;
    } catch (err: any) {
      logger.warn('[FriendService] fetchBlockedUsers error:', err);
      return [];
    }
  }

  /** Check if a user can send another friend request (max 2). */
  async checkRequestLimit(fromId: string, toId: string): Promise<{ canSend: boolean; count: number }> {
    try {
      const { data } = await supabase
        .from('friendship_requests')
        .select('request_count')
        .eq('from_user_id', fromId)
        .eq('to_user_id', toId)
        .single();

      if (!data) return { canSend: true, count: 0 };
      return { canSend: data.request_count < 2, count: data.request_count };
    } catch {
      return { canSend: true, count: 0 };
    }
  }
}

export const friendService = new FriendService();
