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
      const channelName = `room-invite-${friendId}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { ack: true } },
      });

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), 3000);
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            clearTimeout(timeout);
            reject(new Error('Channel subscription failed'));
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

      // Cleanup sender channel after dispatch
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);

      logger.info(`[RoomInvite] Invite sent to friend ${friendId} for room ${room.inviteCode}`);
      return true;
    } catch (err: any) {
      logger.warn('[RoomInvite] Failed to send room invite:', err?.message || err);
      return false;
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
