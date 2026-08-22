/**
 * Stats store — daily/weekly/monthly progress tracking.
 * Uses mock data until M03 provides real persistence.
 */
import { create } from 'zustand';

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

export const useStatsStore = create<StatsState & StatsActions>((set) => ({
  ...initialStats,

  setDaily: (daily) => set({ daily }),
  setStreak: (streak) => set({ streak }),
  recordPomodoro: (seconds) =>
    set((s) => ({
      totalPomodoros: s.totalPomodoros + 1,
      totalWorkSeconds: s.totalWorkSeconds + seconds,
    })),
  recordTaskCompleted: () =>
    set((s) => ({ totalTasksCompleted: s.totalTasksCompleted + 1 })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialStats),
}));
