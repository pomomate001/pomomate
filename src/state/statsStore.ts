/**
 * Stats store — daily/weekly/monthly progress tracking.
 * Uses mock data until M03 provides real persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../platform/storage';

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

export const useStatsStore = create<StatsState & StatsActions>()(
  persist(
    (set) => ({
      ...initialStats,

      setDaily: (daily) => set({ daily }),
      setStreak: (streak) => set({ streak }),
      recordPomodoro: (seconds) =>
        set((s) => {
          const todayStr = new Date().toISOString().split('T')[0];
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
          return {
            totalPomodoros: s.totalPomodoros + 1,
            totalWorkSeconds: s.totalWorkSeconds + seconds,
            daily: newDaily,
          };
        }),
      recordTaskCompleted: () =>
        set((s) => {
          const todayStr = new Date().toISOString().split('T')[0];
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
