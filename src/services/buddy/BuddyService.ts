import { supabase } from '../auth/supabaseClient';
import { useBuddyStore } from '../../state/buddyStore';
import { useTimerStore } from '../../state/timerStore';
import { useTaskStore } from '../../state/taskStore';
import { logger } from '../../utils/logger';
import type { BuddySession, BuddyEmojiCode, TimerMode } from '../../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class BuddyService {
  private channel: RealtimeChannel | null = null;

  /** Create a new buddy session (host initiates). */
  async createSession(hostId: string): Promise<BuddySession | null> {
    try {
      const { data, error } = await supabase
        .from('buddy_sessions')
        .insert({
          host_id: hostId,
          status: 'pending',
          timer_mode: 'work',
          timer_remaining_seconds: 1500,
          timer_is_running: false,
          current_cycle: 1,
        })
        .select()
        .single();

      if (error || !data) {
        logger.warn('[BuddyService] createSession error:', error?.message);
        return null;
      }

      const session = this.mapSession(data);
      useBuddyStore.getState().setActiveSession(session);
      useBuddyStore.getState().setMyRole('host');
      return session;
    } catch (err: any) {
      logger.warn('[BuddyService] createSession error:', err);
      return null;
    }
  }

  /** Invite a friend to the buddy session. Sends a realtime broadcast. */
  async inviteFriend(sessionId: string, friendId: string, hostProfile: { userId: string; displayName: string; avatarUrl?: string }): Promise<boolean> {
    try {
      // Update session with guest
      const { error } = await supabase
        .from('buddy_sessions')
        .update({ guest_id: friendId })
        .eq('id', sessionId);

      if (error) {
        logger.warn('[BuddyService] inviteFriend error:', error.message);
        return false;
      }

      // Broadcast invite to the friend's personal channel
      const friendChannel = supabase.channel(`buddy-invite:${friendId}`);
      await friendChannel.subscribe();
      await friendChannel.send({
        type: 'broadcast',
        event: 'buddy_invite',
        payload: { sessionId, hostProfile },
      });
      supabase.removeChannel(friendChannel);

      return true;
    } catch (err: any) {
      logger.warn('[BuddyService] inviteFriend error:', err);
      return false;
    }
  }

  /** Accept an incoming buddy invite. */
  async acceptInvite(sessionId: string, guestId: string): Promise<BuddySession | null> {
    try {
      const { data, error } = await supabase
        .from('buddy_sessions')
        .update({ guest_id: guestId, status: 'active' })
        .eq('id', sessionId)
        .select()
        .single();

      if (error || !data) {
        logger.warn('[BuddyService] acceptInvite error:', error?.message);
        return null;
      }

      // Broadcast guest_joined so the host is notified
      const channel = supabase.channel(`buddy:${sessionId}`);
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'guest_joined',
        payload: { guestId },
      });
      supabase.removeChannel(channel);

      const session = this.mapSession(data);
      useBuddyStore.getState().setActiveSession(session);
      useBuddyStore.getState().setMyRole('guest');
      useBuddyStore.getState().setPendingInvite(null);
      return session;
    } catch (err: any) {
      logger.warn('[BuddyService] acceptInvite error:', err);
      return null;
    }
  }

  /** Decline an incoming buddy invite. */
  async declineInvite(sessionId: string): Promise<void> {
    useBuddyStore.getState().setPendingInvite(null);
    // Broadcast decline
    const channel = supabase.channel(`buddy:${sessionId}`);
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'invite_declined',
      payload: {},
    });
    supabase.removeChannel(channel);
  }

  /** End the buddy session. */
  async endSession(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('buddy_sessions')
        .update({ status: 'ended' })
        .eq('id', sessionId);

      // Broadcast end
      if (this.channel) {
        await this.channel.send({
          type: 'broadcast',
          event: 'session_ended',
          payload: {},
        });
      }

      this.unsubscribe();
      useBuddyStore.getState().endSession();
    } catch (err: any) {
      logger.warn('[BuddyService] endSession error:', err);
    }
  }

  /** Update timer state (host only). Broadcasts to guest. */
  async updateTimerState(
    sessionId: string,
    state: {
      timerMode?: TimerMode;
      timerRemainingSeconds?: number;
      timerIsRunning?: boolean;
      currentCycle?: number;
      activeTaskTitle?: string | null;
      targetEndTime?: number | null;
    },
  ): Promise<void> {
    try {
      const dbPatch: any = {};
      if (state.timerMode !== undefined) dbPatch.timer_mode = state.timerMode;
      if (state.timerRemainingSeconds !== undefined) dbPatch.timer_remaining_seconds = state.timerRemainingSeconds;
      if (state.timerIsRunning !== undefined) dbPatch.timer_is_running = state.timerIsRunning;
      if (state.currentCycle !== undefined) dbPatch.current_cycle = state.currentCycle;
      if (state.activeTaskTitle !== undefined) dbPatch.active_task_title = state.activeTaskTitle;
      // targetEndTime doesn't need to be in DB, it's just for realtime sync

      await supabase
        .from('buddy_sessions')
        .update(dbPatch)
        .eq('id', sessionId);

      // Broadcast update
      if (this.channel) {
        await this.channel.send({
          type: 'broadcast',
          event: 'timer_update',
          payload: state,
        });
      }
    } catch (err: any) {
      logger.warn('[BuddyService] updateTimerState error:', err);
    }
  }

  /** Send an emoji reaction. */
  async sendEmoji(sessionId: string, senderId: string, emojiCode: BuddyEmojiCode): Promise<void> {
    try {
      // Save to DB
      await supabase.from('buddy_emojis').insert({
        session_id: sessionId,
        sender_id: senderId,
        emoji_code: emojiCode,
      });

      // Broadcast
      if (this.channel) {
        await this.channel.send({
          type: 'broadcast',
          event: 'emoji_sent',
          payload: { senderId, emojiCode, timestamp: new Date().toISOString() },
        });
      }
    } catch (err: any) {
      logger.warn('[BuddyService] sendEmoji error:', err);
    }
  }

  /** Broadcast a task sync event to keep tasks in sync between buddies. */
  async broadcastTask(sessionId: string, action: 'add' | 'update' | 'delete' | 'reorder', taskOrId: any): Promise<void> {
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'task_sync',
        payload: { action, taskOrId },
      });
    }
  }

  /** Subscribe to a buddy session's realtime channel. */
  subscribeToSession(
    sessionId: string,
    userId: string,
    callbacks: {
      onTimerUpdate?: (state: any) => void;
      onEmojiReceived?: (data: { senderId: string; emojiCode: BuddyEmojiCode }) => void;
      onSessionEnded?: () => void;
      onInviteDeclined?: () => void;
      onGuestJoined?: (guestId: string) => void;
    },
  ): void {
    this.unsubscribe();

    this.channel = supabase.channel(`buddy:${sessionId}`, {
      config: { presence: { key: userId } },
    });

    this.channel
      .on('broadcast', { event: 'timer_update' }, (payload) => {
        callbacks.onTimerUpdate?.(payload.payload);
        useBuddyStore.getState().updateTimerState(payload.payload);
        
        // Also update local timerStore for guest
        const state = payload.payload;
        const updates: any = { isRemoteUpdate: true };
        if (state.timerMode !== undefined) updates.mode = state.timerMode;
        if (state.timerRemainingSeconds !== undefined) updates.remainingSeconds = state.timerRemainingSeconds;
        if (state.timerIsRunning !== undefined) updates.isRunning = state.timerIsRunning;
        if (state.currentCycle !== undefined) updates.currentCycle = state.currentCycle;
        if (state.targetEndTime !== undefined) updates.targetEndTime = state.targetEndTime;
        
        useTimerStore.getState().setTimerState(updates);
      })
      .on('broadcast', { event: 'task_sync' }, (payload) => {
        const { action, taskOrId } = payload.payload as { action: string, taskOrId: any };
        const store = useTaskStore.getState();
        
        if (action === 'add') {
          // Check if it already exists
          if (!store.tasks.find((t: any) => t.id === taskOrId.id)) {
            store.addTask(taskOrId);
          }
        } else if (action === 'update') {
          store.updateTask(taskOrId.id, taskOrId.updates);
        } else if (action === 'delete') {
          store.removeTask(taskOrId);
        } else if (action === 'reorder') {
          store.reorderTasks(taskOrId);
        }
      })
      .on('broadcast', { event: 'emoji_sent' }, (payload) => {
        const data = payload.payload as { senderId: string; emojiCode: BuddyEmojiCode };
        if (data.senderId !== userId) {
          callbacks.onEmojiReceived?.(data);
          useBuddyStore.getState().addEmoji({
            id: Date.now().toString(),
            sessionId,
            senderId: data.senderId,
            emojiCode: data.emojiCode,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .on('broadcast', { event: 'session_ended' }, () => {
        callbacks.onSessionEnded?.();
        useBuddyStore.getState().endSession();
        this.unsubscribe();
      })
      .on('broadcast', { event: 'invite_declined' }, () => {
        callbacks.onInviteDeclined?.();
      })
      .on('broadcast', { event: 'guest_joined' }, (payload) => {
        const guestId = payload.payload?.guestId;
        const currentSession = useBuddyStore.getState().activeSession;
        if (currentSession) {
          useBuddyStore.getState().setActiveSession({
            ...currentSession,
            guestId,
            status: 'active'
          });
        }
        callbacks.onGuestJoined?.(guestId);
      })
      .subscribe();
  }

  /** Listen for incoming buddy invites on user's personal channel. */
  listenForInvites(
    userId: string,
    onInvite: (data: { sessionId: string; hostProfile: { userId: string; displayName: string; avatarUrl?: string } }) => void,
  ): void {
    const channel = supabase.channel(`buddy-invite:${userId}`);
    channel
      .on('broadcast', { event: 'buddy_invite' }, (payload) => {
        onInvite(payload.payload as any);
      })
      .subscribe();
  }

  /** Unsubscribe from current session channel. */
  unsubscribe(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  /** Map DB row to BuddySession model. */
  private mapSession(row: any): BuddySession {
    return {
      id: row.id,
      hostId: row.host_id,
      guestId: row.guest_id,
      status: row.status,
      timerMode: row.timer_mode,
      timerRemainingSeconds: row.timer_remaining_seconds,
      timerIsRunning: row.timer_is_running,
      currentCycle: row.current_cycle,
      activeTaskTitle: row.active_task_title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const buddyService = new BuddyService();
