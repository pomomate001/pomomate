/**
 * Timer store — Pomodoro timer state.
 *
 * Holds the current timer state and the actions to mutate it. The actual
 * ticking mechanism (interval/animation loop) is wired up by the UI layer in
 * M02; this store only owns the state transitions.
 */
import { create } from 'zustand';
import { DEFAULT_DURATIONS, getNextMode } from '../core';
import type { TimerMode, TimerState } from '../types';

interface TimerStore extends TimerState {
  /** Number of completed work intervals in the current set. */
  completedWorkCycles: number;
  targetEndTime: number | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  syncWithCurrentTime: () => void;
  setMode: (mode: TimerMode) => void;
  setTimerState: (state: Partial<TimerState> & { targetEndTime?: number | null; isRemoteUpdate?: boolean }) => void;
  /** Advances to the next mode in the pomodoro sequence. */
  next: () => void;
  clearRemoteUpdateFlag: () => void;
}

const initialState: TimerState & { completedWorkCycles: number; targetEndTime: number | null } = {
  duration: DEFAULT_DURATIONS.work,
  remainingSeconds: DEFAULT_DURATIONS.work,
  isRunning: false,
  mode: 'work',
  currentCycle: 1,
  completedWorkCycles: 0,
  targetEndTime: null,
};

export const useTimerStore = create<TimerStore & { isRemoteUpdate?: boolean }>((set, get) => ({
  ...initialState,
  isRemoteUpdate: false,

  start: () =>
    set((state) => ({
      isRunning: true,
      targetEndTime: Date.now() + state.remainingSeconds * 1000,
    })),

  pause: () => set({ isRunning: false, targetEndTime: null }),

  reset: () =>
    set((state) => ({
      isRunning: false,
      targetEndTime: null,
      remainingSeconds: DEFAULT_DURATIONS[state.mode],
      duration: DEFAULT_DURATIONS[state.mode],
    })),

  tick: () =>
    set((state) => {
      if (state.targetEndTime) {
        const remaining = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
        return {
          remainingSeconds: remaining,
          isRunning: remaining > 0 ? state.isRunning : false,
          targetEndTime: remaining > 0 ? state.targetEndTime : null,
        };
      }
      const remaining = Math.max(0, state.remainingSeconds - 1);
      return {
        remainingSeconds: remaining,
        isRunning: remaining > 0 ? state.isRunning : false,
      };
    }),

  syncWithCurrentTime: () =>
    set((state) => {
      if (state.isRunning && state.targetEndTime) {
        const remaining = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
        return {
          remainingSeconds: remaining,
          isRunning: remaining > 0 ? state.isRunning : false,
          targetEndTime: remaining > 0 ? state.targetEndTime : null,
        };
      }
      return state;
    }),

  setMode: (mode) =>
    set({
      mode,
      duration: DEFAULT_DURATIONS[mode],
      remainingSeconds: DEFAULT_DURATIONS[mode],
      isRunning: false,
      targetEndTime: null,
    }),

  setTimerState: (newState) => set((state) => ({ ...state, ...newState })),
  
  clearRemoteUpdateFlag: () => set({ isRemoteUpdate: false }),

  next: () => {
    const { mode, completedWorkCycles, currentCycle } = get();
    const nextCompleted =
      mode === 'work' ? completedWorkCycles + 1 : completedWorkCycles;
    const nextMode = getNextMode(mode, nextCompleted);
    set({
      mode: nextMode,
      duration: DEFAULT_DURATIONS[nextMode],
      remainingSeconds: DEFAULT_DURATIONS[nextMode],
      isRunning: false,
      targetEndTime: null,
      completedWorkCycles: nextCompleted,
      currentCycle: nextMode === 'work' ? currentCycle + 1 : currentCycle,
    });
  },
}));
