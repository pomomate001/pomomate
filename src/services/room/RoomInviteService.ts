/**
 * Real-time Room Invitation Service.
 * 
 * Allows users to invite friends to a study room with 1-tap,
 * delivering an instant broadcast to the friend's device.
 */
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RoomInvitePayload {
  roomId: string;
  roomName: string;
  inviteCode: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: string;
}

type InviteCallback = (invite: RoomInvitePayload) => void;

export class RoomInviteService {
  private activeChannel: RealtimeChannel | null = null;

  /**
   * Send a real-time room invite to a specific friend.
   */
  async inviteFriend(
    friendId: string,
    room: { id: string; name: string; inviteCode: string },
    sender: { id: string; displayName: string; avatarUrl?: string | null }
  ): Promise<boolean> {
    try {
      // 1. Save to Supabase room_invitations table for persistent notifications
      await supabase.from('room_invitations').insert({
        room_id: room.id,
        room_name: room.name,
        invite_code: room.inviteCode,
        sender_id: sender.id,
        sender_name: sender.displayName || 'Bir arkadaşın',
        receiver_id: friendId,
        status: 'pending',
      });

      // 2. Broadcast via Realtime channel for instant popup
      const channelName = `room-invite-${friendId}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { ack: false } },
      });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 2000);
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      const payload: RoomInvitePayload = {
        roomId: room.id,
        roomName: room.name,
        inviteCode: room.inviteCode,
        senderId: sender.id,
        senderName: sender.displayName || 'Bir arkadaşın',
        senderAvatar: sender.avatarUrl,
        timestamp: new Date().toISOString(),
      };

      await channel.send({
        type: 'broadcast',
        event: 'room_invite',
        payload,
      });

      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 500);

      logger.info(`[RoomInvite] Invite sent to friend ${friendId} for room ${room.inviteCode}`);
      return true;
    } catch (err: any) {
      logger.warn('[RoomInvite] Failed to send room invite:', err?.message || err);
      return false;
    }
  }

  /**
   * Fetch all active pending invitations for the current user.
   */
  async getPendingInvites(userId: string): Promise<
    {
      id: string;
      roomId: string;
      roomName: string;
      inviteCode: string;
      senderId: string;
      senderName: string;
      createdAt: string;
    }[]
  > {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('room_invitations')
        .select('id, room_id, room_name, invite_code, sender_id, sender_name, created_at, rooms!inner(is_active)')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .eq('rooms.is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback without join if foreign key alias issue
        const { data: fallbackData } = await supabase
          .from('room_invitations')
          .select('id, room_id, room_name, invite_code, sender_id, sender_name, created_at')
          .eq('receiver_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        return (fallbackData || []).map((row: any) => ({
          id: row.id,
          roomId: row.room_id,
          roomName: row.room_name,
          inviteCode: row.invite_code,
          senderId: row.sender_id,
          senderName: row.sender_name,
          createdAt: row.created_at,
        }));
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        roomName: row.room_name,
        inviteCode: row.invite_code,
        senderId: row.sender_id,
        senderName: row.sender_name,
        createdAt: row.created_at,
      }));
    } catch (e) {
      logger.warn('[RoomInvite] Failed to fetch pending invites:', e);
      return [];
    }
  }

  /**
   * Accept or reject a room invitation.
   */
  async respondToInvite(inviteId: string, status: 'accepted' | 'rejected'): Promise<void> {
    try {
      await supabase
        .from('room_invitations')
        .update({ status })
        .eq('id', inviteId);
    } catch (e) {
      logger.warn('[RoomInvite] Failed to respond to invite:', e);
    }
  }

  /**
   * Listen for incoming room invitations for the current user.
   */
  listenForInvites(userId: string, onInvite: InviteCallback): () => void {
    if (!userId) return () => {};

    if (this.activeChannel) {
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
    }

    const channelName = `room-invite-${userId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'room_invite' }, (msg) => {
        try {
          const invite = msg.payload as RoomInvitePayload;
          if (invite && invite.roomId && invite.inviteCode) {
            onInvite(invite);
          }
        } catch (e) {
          logger.warn('[RoomInvite] Error handling incoming invite:', e);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`[RoomInvite] Subscribed to incoming room invites on ${channelName}`);
        }
      });

    this.activeChannel = channel;

    return () => {
      supabase.removeChannel(channel);
      if (this.activeChannel === channel) {
        this.activeChannel = null;
      }
    };
  }
}

export const roomInviteService = new RoomInviteService();
