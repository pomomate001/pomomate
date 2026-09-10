/**
 * StatsService — handles synchronizing user and friends statistics with Supabase.
 */
import { supabase } from '../auth/supabaseClient';
import { useStatsStore, DailyStat, calculateStreak } from '../../state/statsStore';
import { useTaskStore } from '../../state/taskStore';
import { storage } from '../../platform/storage';
import { networkMonitor } from '../mobile/network/NetworkMonitor';
import { logger } from '../../utils/logger';
import { toLocalDateStr } from '../../utils/datetime';
import type { TimerMode, Task } from '../../types';

export interface FriendStatSummary {
  userId: string;
  totalWorkSeconds: number;
  totalPomodoros: number;
  streak: number;
}

export type OfflineQueueItem =
  | {
      id: string;
      type: 'session';
      userId: string;
      durationSeconds: number;
      mode: TimerMode;
      roomId: string | null;
      completedAt: string;
    }
  | {
      id: string;
      type: 'completed_task';
      userId: string;
      taskTitle: string;
      completedAt: string;
    }
  | {
      id: string;
      type: 'undo_task';
      userId: string;
      taskTitle: string;
      timestamp: string;
    };

const OFFLINE_QUEUE_KEY = 'pomomate-offline-sync-queue';

export class StatsService {
  private isFlushing = false;

  private async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    try {
      const raw = await storage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private async saveOfflineQueue(queue: OfflineQueueItem[]): Promise<void> {
    try {
      await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      logger.warn('[StatsService] Failed to save offline queue:', err);
    }
  }

  private async enqueue(item: OfflineQueueItem): Promise<void> {
    const queue = await this.getOfflineQueue();
    queue.push(item);
    await this.saveOfflineQueue(queue);
    logger.info(`[StatsService] Enqueued offline item: ${item.type} (queue size: ${queue.length})`);
  }

  /**
   * Flushes pending offline sessions and completed tasks to Supabase.
   */
  async flushOfflineQueue(): Promise<void> {
    if (this.isFlushing) return;
    if (!networkMonitor.getIsConnected()) return;

    const queue = await this.getOfflineQueue();
    if (queue.length === 0) return;

    this.isFlushing = true;
    const remaining: OfflineQueueItem[] = [];
    let flushedAny = false;

    try {
      for (const item of queue) {
        try {
          if (item.type === 'session') {
            const { error } = await supabase.from('pomodoro_sessions').insert({
              user_id: item.userId,
              duration_seconds: item.durationSeconds,
              mode: item.mode,
              room_id: item.roomId,
              completed_at: item.completedAt,
            });
            if (error) {
              remaining.push(item);
            } else {
              flushedAny = true;
            }
          } else if (item.type === 'completed_task') {
            const { error } = await supabase.from('completed_tasks').insert({
              user_id: item.userId,
              task_title: item.taskTitle,
              completed_at: item.completedAt,
            });
            if (error) {
              remaining.push(item);
            } else {
              flushedAny = true;
            }
          } else if (item.type === 'undo_task') {
            const { data } = await supabase
              .from('completed_tasks')
              .select('id')
              .eq('user_id', item.userId)
              .eq('task_title', item.taskTitle)
              .order('completed_at', { ascending: false })
              .limit(1);

            if (data && data.length > 0) {
              await supabase.from('completed_tasks').delete().eq('id', data[0].id);
              flushedAny = true;
            } else {
              flushedAny = true;
            }
          }
        } catch {
          remaining.push(item);
        }
      }

      await this.saveOfflineQueue(remaining);

      if (flushedAny) {
        logger.info(`[StatsService] Flushed offline sync queue. Remaining items: ${remaining.length}`);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Records a completed pomodoro session to the remote Supabase database,
   * falling back to the local offline queue if offline.
   */
  async recordSession(
    userId: string,
    durationSeconds: number,
    mode: TimerMode = 'work',
    roomId?: string | null,
  ): Promise<void> {
    if (!userId) return;

    const completedAt = new Date().toISOString();

    if (!networkMonitor.getIsConnected()) {
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'session',
        userId,
        durationSeconds,
        mode,
        roomId: roomId || null,
        completedAt,
      });
      return;
    }

    try {
      const { error } = await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        duration_seconds: durationSeconds,
        mode,
        room_id: roomId || null,
        completed_at: completedAt,
      });

      if (error) {
        logger.warn('[StatsService] Failed to record session to Supabase, enqueuing offline:', error.message);
        await this.enqueue({
          id: Math.random().toString(36).substring(7),
          type: 'session',
          userId,
          durationSeconds,
          mode,
          roomId: roomId || null,
          completedAt,
        });
      }
    } catch (err: any) {
      logger.warn('[StatsService] recordSession network error, enqueuing offline:', err);
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'session',
        userId,
        durationSeconds,
        mode,
        roomId: roomId || null,
        completedAt,
      });
    }
  }

  /**
   * Records a completed task to the historical log in Supabase,
   * falling back to the local offline queue if offline.
   */
  async recordCompletedTask(userId: string, taskTitle: string): Promise<void> {
    if (!userId || !taskTitle) return;

    const completedAt = new Date().toISOString();

    if (!networkMonitor.getIsConnected()) {
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'completed_task',
        userId,
        taskTitle,
        completedAt,
      });
      return;
    }

    try {
      const { error } = await supabase.from('completed_tasks').insert({
        user_id: userId,
        task_title: taskTitle,
        completed_at: completedAt,
      });

      if (error) {
        logger.warn('[StatsService] Failed to record completed task, enqueuing offline:', error.message);
        await this.enqueue({
          id: Math.random().toString(36).substring(7),
          type: 'completed_task',
          userId,
          taskTitle,
          completedAt,
        });
      }
    } catch (err: any) {
      logger.warn('[StatsService] recordCompletedTask error, enqueuing offline:', err);
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'completed_task',
        userId,
        taskTitle,
        completedAt,
      });
    }
  }

  /**
   * Removes the most recent matching completed task record from Supabase when a task is unchecked.
   */
  async undoCompletedTask(userId: string, taskTitle: string): Promise<void> {
    if (!userId || !taskTitle) return;

    // Check if it's pending in offline queue first
    const queue = await this.getOfflineQueue();
    const pendingIndex = queue.findIndex(
      (item) => item.type === 'completed_task' && item.userId === userId && item.taskTitle === taskTitle
    );
    if (pendingIndex !== -1) {
      queue.splice(pendingIndex, 1);
      await this.saveOfflineQueue(queue);
      logger.info(`[StatsService] Removed uncompleted task from offline queue: ${taskTitle}`);
      return;
    }

    if (!networkMonitor.getIsConnected()) {
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'undo_task',
        userId,
        taskTitle,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const { data, error: selectError } = await supabase
        .from('completed_tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('task_title', taskTitle)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (selectError) {
        logger.warn('[StatsService] Failed to find completed task to undo, enqueuing:', selectError.message);
        await this.enqueue({
          id: Math.random().toString(36).substring(7),
          type: 'undo_task',
          userId,
          taskTitle,
          timestamp: new Date().toISOString(),
        });
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
      logger.warn('[StatsService] undoCompletedTask error, enqueuing:', err);
      await this.enqueue({
        id: Math.random().toString(36).substring(7),
        type: 'undo_task',
        userId,
        taskTitle,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Fetches aggregated statistics for a list of friend user IDs using Supabase RPC.
   * Optionally filters by date range (startDate to endDate) for period-specific stats.
   */
  async fetchFriendsStats(
    friendIds: string[],
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, FriendStatSummary>> {
    if (!friendIds || friendIds.length === 0) return {};

    try {
      const params: Record<string, any> = {
        p_friend_ids: friendIds,
      };
      if (startDate) params.p_start_date = startDate;
      if (endDate) params.p_end_date = endDate;

      const { data, error } = await supabase.rpc('get_friends_stats', params);

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
   * Syncs user stats from Supabase to restore totals, daily progress, and past completed tasks
   * on reinstall / update. Merges remote pomodoro data and completed task data with existing local state.
   */
  async syncUserStats(userId: string): Promise<void> {
    if (!userId) return;

    try {
      // Flush any queued offline events first
      await this.flushOfflineQueue();

      // Fetch pomodoro sessions from Supabase
      const { data: sessionData, error: sessionError } = await supabase
        .from('pomodoro_sessions')
        .select('duration_seconds, mode, completed_at')
        .eq('user_id', userId)
        .eq('mode', 'work')
        .order('completed_at', { ascending: true });

      // Fetch completed tasks from Supabase (include id and task_title for historical calendar restoration)
      const { data: taskData, error: taskError } = await supabase
        .from('completed_tasks')
        .select('id, task_title, completed_at')
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

      // Add completed task counts to daily map AND collect historical tasks to restore in taskStore
      let remoteTotalTasks = 0;
      const remoteTasksToRestore: Task[] = [];

      if (taskData && taskData.length > 0) {
        for (const row of taskData) {
          remoteTotalTasks += 1;
          const dateStr = toLocalDateStr(new Date(row.completed_at));
          const current = remoteDailyMap.get(dateStr) || { totalSeconds: 0, pomodorosCompleted: 0, tasksCompleted: 0 };
          current.tasksCompleted += 1;
          remoteDailyMap.set(dateStr, current);

          remoteTasksToRestore.push({
            id: row.id,
            userId,
            title: row.task_title,
            completed: true,
            pomodoroCount: 1,
            targetPomodoroCount: 1,
            targetDate: dateStr,
            createdAt: row.completed_at,
          });
        }
      }

      // Restore historical completed tasks into useTaskStore for monthly calendar
      if (remoteTasksToRestore.length > 0) {
        const taskStore = useTaskStore.getState();
        const existingTasks = taskStore.tasks || [];
        const existingIds = new Set(existingTasks.map((t) => t.id));
        const existingSigs = new Set(
          existingTasks.map((t) => `${t.title}::${t.targetDate || ''}::${t.completed}`)
        );

        const newTasksToAppend: Task[] = [];
        for (const remoteTask of remoteTasksToRestore) {
          const sig = `${remoteTask.title}::${remoteTask.targetDate}::true`;
          if (!existingIds.has(remoteTask.id) && !existingSigs.has(sig)) {
            newTasksToAppend.push(remoteTask);
            existingIds.add(remoteTask.id);
            existingSigs.add(sig);
          }
        }

        if (newTasksToAppend.length > 0) {
          taskStore.setTasks([...existingTasks, ...newTasksToAppend]);
          logger.info(`[StatsService] Restored ${newTasksToAppend.length} historical completed tasks from Supabase into taskStore.`);
        }
      }

      // If no remote data at all, skip stats store merge
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

