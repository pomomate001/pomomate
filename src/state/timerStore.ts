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

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  /** Advances to the next mode in the pomodoro sequence. */
  next: () => void;
}

const initialState: TimerState & { completedWorkCycles: number } = {
  duration: DEFAULT_DURATIONS.work,
  remainingSeconds: DEFAULT_DURATIONS.work,
  isRunning: false,
  mode: 'work',
  currentCycle: 1,
  completedWorkCycles: 0,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...initialState,

  start: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  reset: () =>
    set((state) => ({
      isRunning: false,
      remainingSeconds: DEFAULT_DURATIONS[state.mode],
      duration: DEFAULT_DURATIONS[state.mode],
    })),

  tick: () =>
    set((state) => ({
      remainingSeconds: Math.max(0, state.remainingSeconds - 1),
      isRunning: state.remainingSeconds - 1 > 0 ? state.isRunning : false,
    })),

  setMode: (mode) =>
    set({
      mode,
      duration: DEFAULT_DURATIONS[mode],
      remainingSeconds: DEFAULT_DURATIONS[mode],
      isRunning: false,
    }),

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
      completedWorkCycles: nextCompleted,
      currentCycle: nextMode === 'work' ? currentCycle + 1 : currentCycle,
    });
  },
}));
