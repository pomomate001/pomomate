/**
 * StatsService — handles synchronizing user and friends statistics with Supabase.
 */
import { supabase } from '../auth/supabaseClient';
import { useStatsStore, DailyStat, calculateStreak } from '../../state/statsStore';
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
   * Removes the most recent matching completed task record from Supabase when a task is unchecked.
   */
  async undoCompletedTask(userId: string, taskTitle: string): Promise<void> {
    if (!userId || !taskTitle) return;

    try {
      const { data, error: selectError } = await supabase
        .from('completed_tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('task_title', taskTitle)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (selectError) {
        logger.warn('[StatsService] Failed to find completed task to undo:', selectError.message);
        return;
      }

      if (data && data.length > 0) {
        const { error: deleteError } = await supabase
          .from('completed_tasks')
          .delete()
          .eq('id', data[0].id);

        if (deleteError) {
          logger.warn('[StatsService] Failed to delete completed task:', deleteError.message);
        }
      }
    } catch (err: any) {
      logger.warn('[StatsService] undoCompletedTask error:', err);
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
   * Merges remote pomodoro data and completed task data with existing local state.
   */
  async syncUserStats(userId: string): Promise<void> {
    if (!userId) return;

    try {
      // Fetch pomodoro sessions from Supabase
      const { data: sessionData, error: sessionError } = await supabase
        .from('pomodoro_sessions')
        .select('duration_seconds, mode, completed_at')
        .eq('user_id', userId)
        .eq('mode', 'work')
        .order('completed_at', { ascending: true });

      // Fetch completed tasks from Supabase
      const { data: taskData, error: taskError } = await supabase
        .from('completed_tasks')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (sessionError) {
        logger.warn('[StatsService] syncUserStats session fetch error:', sessionError.message);
      }
      if (taskError) {
        logger.warn('[StatsService] syncUserStats task fetch error:', taskError.message);
      }

      // Build remote daily map from pomodoro sessions
      const remoteDailyMap = new Map<string, { totalSeconds: number; pomodorosCompleted: number; tasksCompleted: number }>();
      let remoteTotalSeconds = 0;
      let remoteTotalPomodoros = 0;

      if (sessionData && sessionData.length > 0) {
        for (const row of sessionData) {
          const sec = Number(row.duration_seconds || 0);
          remoteTotalSeconds += sec;
          remoteTotalPomodoros += 1;

          const dateStr = toLocalDateStr(new Date(row.completed_at));
          const current = remoteDailyMap.get(dateStr) || { totalSeconds: 0, pomodorosCompleted: 0, tasksCompleted: 0 };
          current.totalSeconds += sec;
          current.pomodorosCompleted += 1;
          remoteDailyMap.set(dateStr, current);
        }
      }

      // Add completed task counts to daily map
      let remoteTotalTasks = 0;
      if (taskData && taskData.length > 0) {
        for (const row of taskData) {
          remoteTotalTasks += 1;
          const dateStr = toLocalDateStr(new Date(row.completed_at));
          const current = remoteDailyMap.get(dateStr) || { totalSeconds: 0, pomodorosCompleted: 0, tasksCompleted: 0 };
          current.tasksCompleted += 1;
          remoteDailyMap.set(dateStr, current);
        }
      }

      // If no remote data at all, skip sync
      if (remoteTotalPomodoros === 0 && remoteTotalTasks === 0) return;

      // Merge with local store — take the maximum of each metric per day
      const localStore = useStatsStore.getState();
      const localDailyMap = new Map<string, DailyStat>();
      for (const d of localStore.daily) {
        localDailyMap.set(d.date, { ...d });
      }

      // Merge: for each date, take the max of remote and local values
      for (const [date, remote] of remoteDailyMap.entries()) {
        const local = localDailyMap.get(date);
        if (local) {
          localDailyMap.set(date, {
            date,
            totalSeconds: Math.max(local.totalSeconds, remote.totalSeconds),
            pomodorosCompleted: Math.max(local.pomodorosCompleted, remote.pomodorosCompleted),
            tasksCompleted: Math.max(local.tasksCompleted, remote.tasksCompleted),
          });
        } else {
          localDailyMap.set(date, {
            date,
            totalSeconds: remote.totalSeconds,
            pomodorosCompleted: remote.pomodorosCompleted,
            tasksCompleted: remote.tasksCompleted,
          });
        }
      }

      const mergedDaily: DailyStat[] = Array.from(localDailyMap.values());
      const streak = calculateStreak(mergedDaily);

      // Use max of remote vs local totals
      const mergedTotalPomodoros = Math.max(remoteTotalPomodoros, localStore.totalPomodoros);
      const mergedTotalWorkSeconds = Math.max(remoteTotalSeconds, localStore.totalWorkSeconds);
      const mergedTotalTasks = Math.max(remoteTotalTasks, localStore.totalTasksCompleted);

      useStatsStore.setState({
        totalPomodoros: mergedTotalPomodoros,
        totalWorkSeconds: mergedTotalWorkSeconds,
        totalTasksCompleted: mergedTotalTasks,
        daily: mergedDaily,
        streak,
      });
    } catch (err: any) {
      logger.warn('[StatsService] syncUserStats error:', err);
    }
  }
}

export const statsService = new StatsService();

