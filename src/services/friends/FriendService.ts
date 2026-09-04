/**
 * FriendService — handles friend list, friendship requests, and friend statistics.
 *
 * Implements M06 friends logic, connecting to Supabase and backend /api/friends.
 */
import { supabase } from '../auth/supabaseClient';
import { useFriendsStore, FriendSummary, FriendRequest } from '../../state/friendsStore';
import { logger } from '../../utils/logger';
import { statsService } from '../stats';
import type { SuggestedUser } from '../../state/friendsStore';
import { t } from '../../i18n';

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

      // 3. Fetch friend stats from Supabase
      const statsMap = await statsService.fetchFriendsStats(friendIds);

      // 4. Assemble summaries with real stats
      const friendList: FriendSummary[] = (profiles ?? []).map((p: any) => {
        const stats = statsMap[p.id];
        return {
          userId: p.id,
          displayName: p.display_name ?? 'Kullanıcı',
          avatarUrl: p.avatar_url,
          totalWorkSeconds: stats?.totalWorkSeconds || 0,
          totalPomodoros: stats?.totalPomodoros || 0,
          streak: stats?.streak || 0,
        };
      });

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
      return { success: false, message: t('friends.invalidUserIdOrCode') };
    }

    // Try to extract a UUID from the input string in case user pasted the whole share message
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = toUserId.match(uuidRegex);
    const cleanToUserId = match ? match[0].toLowerCase() : toUserId.trim();

    if (cleanToUserId === fromUserId) {
      return { success: false, message: t('friends.cannotSendToSelf') };
    }

    // Validate if it's a valid UUID
    if (!uuidRegex.test(cleanToUserId)) {
      return { success: false, message: t('friends.invalidCodeFormat') };
    }

    try {
      // 1. Check if blocked
      const { data: blockData } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`and(blocker_id.eq.${fromUserId},blocked_id.eq.${cleanToUserId}),and(blocker_id.eq.${cleanToUserId},blocked_id.eq.${fromUserId})`)
        .limit(1);
      
      if (blockData && blockData.length > 0) {
        return { success: false, message: t('friends.cannotInteractWithUser') };
      }

      // 2. Check request limit BEFORE sending
      const limitInfo = await this.checkRequestLimit(fromUserId, cleanToUserId);
      if (!limitInfo.canSend) {
        return { success: false, message: t('friends.requestLimitReached') };
      }

      // Check if user exists
      const { data: targetUser, error: uErr } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', cleanToUserId)
        .single();

      if (uErr || !targetUser) {
        return { success: false, message: t('friends.userNotFound') };
      }

      // Check if already friends
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_a.eq.${fromUserId},user_b.eq.${cleanToUserId}),and(user_a.eq.${cleanToUserId},user_b.eq.${fromUserId})`)
        .single();

      if (existingFriendship) {
        return { success: false, message: t('friends.alreadyFriendsWithUser') };
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
          return { success: false, message: t('friends.requestAlreadyPending') };
        }
        if (existingReq.status === 'accepted') {
          return { success: false, message: t('friends.alreadyFriendsWithUser') };
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
          return { success: true, message: t('friends.requestSentSuccess', { name: targetUser.display_name || t('common.friend') }) };
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
          return { success: false, message: t('friends.requestAlreadyPending') };
        }
        return { success: false, message: reqErr.message };
      }

      return { success: true, message: t('friends.requestSentSuccess', { name: targetUser.display_name || t('common.friend') }) };
    } catch (err: any) {
      return { success: false, message: err.message ?? t('friends.requestSendFailed') };
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
      const { data, error } = await supabase.rpc('accept_friend_request', {
        req_id: requestId,
      });

      if (error) throw error;
      if (!data) return false; // Returns true if successful

      // Refresh friends and requests
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

  /** Discover users using the server-side RPC with direct database fallback. */
  async discoverUsers(
    _userId: string,
    limit: number = 20,
    offset: number = 0,
    category: string | null = null,
    search: string | null = null,
    sameCountryOnly: boolean = false,
    userCountryCode?: string | null
  ): Promise<SuggestedUser[]> {
    try {
      let userRows: any = null;

      // 1. Attempt RPC with 5 parameters (including p_same_country_only)
      const { data, error } = await supabase.rpc('discover_users', {
        p_limit: limit,
        p_offset: offset,
        p_category: category,
        p_search: search,
        p_same_country_only: sameCountryOnly,
      });

      if (!error && data) {
        userRows = data;
      } else {
        // Fallback: Attempt legacy 4-parameter RPC if migration 012 not yet applied
        const { data: legacyData, error: legacyError } = await supabase.rpc('discover_users', {
          p_limit: limit,
          p_offset: offset,
          p_category: category,
          p_search: search,
        });
        if (!legacyError && legacyData) {
          userRows = legacyData;
        }
      }

      // Fallback: If both RPCs error or return empty, query users table directly
      if (!userRows || userRows.length === 0) {
        let query = supabase
          .from('users')
          .select('id, display_name, avatar_url, country_code')
          .neq('id', _userId);

        if (sameCountryOnly && userCountryCode) {
          query = query.eq('country_code', userCountryCode);
        }

        if (search && search.trim().length > 0) {
          query = query.ilike('display_name', `%${search.trim()}%`);
        }

        const { data: directUsers, error: dErr } = await query.range(offset, offset + limit - 1);
        if (!dErr && directUsers) {
          userRows = directUsers.map((u: any) => ({
            user_id: u.id,
            display_name: u.display_name,
            avatar_url: u.avatar_url,
            country_code: u.country_code,
            match_score: 50,
            matching_tag_count: 0,
            tags: [],
          }));
        }
      }

      // Client-side country filter defense: guarantee users match when sameCountryOnly is active
      if (sameCountryOnly && userCountryCode && Array.isArray(userRows)) {
        userRows = userRows.filter((r: any) => r.country_code === userCountryCode);
      }

      const suggestions: SuggestedUser[] = (userRows ?? []).map((row: any) => ({
        userId: row.user_id,
        displayName: (row.display_name && row.display_name.trim().length > 0) ? row.display_name : 'Kullanıcı',
        avatarUrl: row.avatar_url,
        countryCode: row.country_code,
        matchScore: row.match_score ?? 0,
        matchingTagCount: row.matching_tag_count ?? 0,
        tags: (row.tags ?? []).map((t: any) => ({
          id: t.id,
          slug: t.slug,
          nameTr: t.nameTr || t.name_tr || '',
          nameEn: t.nameEn || t.name_en || '',
          category: t.category,
          icon: t.icon,
        })),
      }));

      // Only update store if it's the first page (offset 0)
      if (offset === 0) {
        useFriendsStore.getState().setSuggestedUsers(suggestions);
      }
      
      return suggestions;
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
