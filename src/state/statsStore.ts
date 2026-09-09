/**
 * Stats store — daily/weekly/monthly progress tracking.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../platform/storage';
import { toLocalDateStr } from '../utils/datetime';

/** Maximum number of daily entries to keep in the persisted store. */
const MAX_DAILY_ENTRIES = 90;

export interface DailyStat {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  pomodorosCompleted: number;
  tasksCompleted: number;
}

export interface StatsState {
  daily: DailyStat[];
  streak: number;
  totalPomodoros: number;
  totalWorkSeconds: number;
  totalTasksCompleted: number;
  isLoading: boolean;
}

interface StatsActions {
  setDaily: (daily: DailyStat[]) => void;
  setStreak: (streak: number) => void;
  recordPomodoro: (seconds: number) => void;
  recordTaskCompleted: () => void;
  undoTaskCompleted: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialStats: StatsState = {
  daily: [],
  streak: 0,
  totalPomodoros: 0,
  totalWorkSeconds: 0,
  totalTasksCompleted: 0,
  isLoading: false,
};

/**
 * Calculates the current streak (consecutive days with at least one pomodoro)
 * counting backwards from today.
 */
function calculateStreak(daily: DailyStat[]): number {
  if (daily.length === 0) return 0;

  // Build a set of dates that have at least one pomodoro
  const activeDates = new Set<string>();
  for (const d of daily) {
    if (d.pomodorosCompleted > 0) {
      activeDates.add(d.date);
    }
  }

  const today = new Date();
  const todayStr = toLocalDateStr(today);

  // Start from today; if today has no activity, check yesterday as the start
  let checkDate = new Date(today);
  if (!activeDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!activeDates.has(toLocalDateStr(checkDate))) {
      return 0;
    }
  }

  let streak = 0;
  // Walk backwards counting consecutive active days
  for (let i = 0; i < MAX_DAILY_ENTRIES; i++) {
    const dateStr = toLocalDateStr(checkDate);
    if (activeDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Trims the daily array to keep only the most recent MAX_DAILY_ENTRIES entries.
 */
function trimDaily(daily: DailyStat[]): DailyStat[] {
  if (daily.length <= MAX_DAILY_ENTRIES) return daily;
  // Sort descending by date and keep the most recent
  const sorted = [...daily].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.slice(0, MAX_DAILY_ENTRIES);
}

export const useStatsStore = create<StatsState & StatsActions>()(
  persist(
    (set) => ({
      ...initialStats,

      setDaily: (daily) => set({ daily }),
      setStreak: (streak) => set({ streak }),
      recordPomodoro: (seconds) =>
        set((s) => {
          const todayStr = toLocalDateStr();
          const existingIndex = s.daily.findIndex((d) => d.date === todayStr);
          const newDaily = [...s.daily];
          if (existingIndex >= 0) {
            newDaily[existingIndex] = {
              ...newDaily[existingIndex],
              totalSeconds: newDaily[existingIndex].totalSeconds + seconds,
              pomodorosCompleted: newDaily[existingIndex].pomodorosCompleted + 1,
            };
          } else {
            newDaily.push({
              date: todayStr,
              totalSeconds: seconds,
              pomodorosCompleted: 1,
              tasksCompleted: 0,
            });
          }

          const trimmedDaily = trimDaily(newDaily);
          const streak = calculateStreak(trimmedDaily);

          return {
            totalPomodoros: s.totalPomodoros + 1,
            totalWorkSeconds: s.totalWorkSeconds + seconds,
            daily: trimmedDaily,
            streak,
          };
        }),
      recordTaskCompleted: () =>
        set((s) => {
          const todayStr = toLocalDateStr();
          const existingIndex = s.daily.findIndex((d) => d.date === todayStr);
          const newDaily = [...s.daily];
          if (existingIndex >= 0) {
            newDaily[existingIndex] = {
              ...newDaily[existingIndex],
              tasksCompleted: newDaily[existingIndex].tasksCompleted + 1,
            };
          } else {
            newDaily.push({
              date: todayStr,
              totalSeconds: 0,
              pomodorosCompleted: 0,
              tasksCompleted: 1,
            });
          }
          return {
            totalTasksCompleted: s.totalTasksCompleted + 1,
            daily: newDaily,
          };
        }),
      undoTaskCompleted: () =>
        set((s) => {
          const todayStr = toLocalDateStr();
          const existingIndex = s.daily.findIndex((d) => d.date === todayStr);
          const newDaily = [...s.daily];
          if (existingIndex >= 0) {
            newDaily[existingIndex] = {
              ...newDaily[existingIndex],
              tasksCompleted: Math.max(0, newDaily[existingIndex].tasksCompleted - 1),
            };
          }
          return {
            totalTasksCompleted: Math.max(0, s.totalTasksCompleted - 1),
            daily: newDaily,
          };
        }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set(initialStats),
    }),
    {
      name: 'pomomate-stats',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        daily: state.daily,
        streak: state.streak,
        totalPomodoros: state.totalPomodoros,
        totalWorkSeconds: state.totalWorkSeconds,
        totalTasksCompleted: state.totalTasksCompleted,
      }),
    }
  )
);
