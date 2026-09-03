/**
 * StatsService — handles synchronizing user and friends statistics with Supabase.
 */
import { supabase } from '../auth/supabaseClient';
import { useStatsStore, DailyStat } from '../../state/statsStore';
import { logger } from '../../utils/logger';
import { toLocalDateStr } from '../../utils/datetime';
import type { TimerMode } from '../../types';

export interface FriendStatSummary {
  userId: string;
  totalWorkSeconds: number;
  totalPomodoros: number;
  streak: number;
}

export class StatsService {
  /**
   * Records a completed pomodoro session to the remote Supabase database.
   */
  async recordSession(
    userId: string,
    durationSeconds: number,
    mode: TimerMode = 'work',
    roomId?: string | null,
  ): Promise<void> {
    if (!userId) return;

    try {
      const { error } = await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        duration_seconds: durationSeconds,
        mode,
        room_id: roomId || null,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        logger.warn('[StatsService] Failed to record session to Supabase:', error.message);
      }
    } catch (err: any) {
      logger.warn('[StatsService] recordSession error:', err);
    }
  }

  /**
   * Records a completed task to the historical log in Supabase.
   */
  async recordCompletedTask(userId: string, taskTitle: string): Promise<void> {
    if (!userId || !taskTitle) return;

    try {
      const { error } = await supabase.from('completed_tasks').insert({
        user_id: userId,
        task_title: taskTitle,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        logger.warn('[StatsService] Failed to record completed task:', error.message);
      }
    } catch (err: any) {
      logger.warn('[StatsService] recordCompletedTask error:', err);
    }
  }

  /**
   * Fetches aggregated statistics for a list of friend user IDs using Supabase RPC.
   */
  async fetchFriendsStats(friendIds: string[]): Promise<Record<string, FriendStatSummary>> {
    if (!friendIds || friendIds.length === 0) return {};

    try {
      const { data, error } = await supabase.rpc('get_friends_stats', {
        p_friend_ids: friendIds,
      });

      if (error) {
        logger.warn('[StatsService] fetchFriendsStats RPC error:', error.message);
        return {};
      }

      const result: Record<string, FriendStatSummary> = {};
      if (Array.isArray(data)) {
        for (const row of data) {
          result[row.user_id] = {
            userId: row.user_id,
            totalWorkSeconds: Number(row.total_work_seconds || 0),
            totalPomodoros: Number(row.total_pomodoros || 0),
            streak: Number(row.streak || 0),
          };
        }
      }
      return result;
    } catch (err: any) {
      logger.warn('[StatsService] fetchFriendsStats error:', err);
      return {};
    }
  }

  /**
   * Syncs user stats from Supabase to restore totals and daily progress on reinstall / update.
   */
  async syncUserStats(userId: string): Promise<void> {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('duration_seconds, mode, completed_at')
        .eq('user_id', userId)
        .eq('mode', 'work')
        .order('completed_at', { ascending: true });

      if (error || !data || data.length === 0) return;

      const dailyMap = new Map<string, { totalSeconds: number; pomodorosCompleted: number }>();
      let totalSeconds = 0;
      let totalPomodoros = 0;

      for (const row of data) {
        const sec = Number(row.duration_seconds || 0);
        totalSeconds += sec;
        totalPomodoros += 1;

        const dateStr = toLocalDateStr(new Date(row.completed_at));
        const current = dailyMap.get(dateStr) || { totalSeconds: 0, pomodorosCompleted: 0 };
        current.totalSeconds += sec;
        current.pomodorosCompleted += 1;
        dailyMap.set(dateStr, current);
      }

      const dailyStats: DailyStat[] = Array.from(dailyMap.entries()).map(([date, val]) => ({
        date,
        totalSeconds: val.totalSeconds,
        pomodorosCompleted: val.pomodorosCompleted,
        tasksCompleted: 0,
      }));

      // Merge with local store
      const localStore = useStatsStore.getState();
      if (totalPomodoros > localStore.totalPomodoros) {
        useStatsStore.setState({
          totalPomodoros,
          totalWorkSeconds: totalSeconds,
          daily: dailyStats,
        });
      }
    } catch (err: any) {
      logger.warn('[StatsService] syncUserStats error:', err);
    }
  }
}

export const statsService = new StatsService();
