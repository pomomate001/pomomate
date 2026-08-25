/**
 * FriendService — handles friend list, friendship requests, and friend statistics.
 *
 * Implements M06 friends logic, connecting to Supabase and backend /api/friends.
 */
import { supabase } from '../auth/supabaseClient';
import { useFriendsStore, FriendSummary, FriendRequest } from '../../state/friendsStore';
import { logger } from '../../utils/logger';

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
      // Check if user exists
      const { data: targetUser, error: uErr } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', cleanToUserId)
        .single();

      if (uErr || !targetUser) {
        // If not found by full UUID, try matching by code/prefix if any
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

      // Send request
      const { error: reqErr } = await supabase
        .from('friendship_requests')
        .insert({
          from_user_id: fromUserId,
          to_user_id: cleanToUserId,
          status: 'pending',
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
}

export const friendService = new FriendService();
