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
import { useSettingsStore } from './settingsStore';

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

export function getDurationForMode(mode: TimerMode): number {
  try {
    const settings = useSettingsStore.getState();
    if (mode === 'work' && settings?.workDuration) return settings.workDuration;
    if (mode === 'shortBreak' && settings?.shortBreakDuration) return settings.shortBreakDuration;
    if (mode === 'longBreak' && settings?.longBreakDuration) return settings.longBreakDuration;
  } catch {
    // Fallback if settings store not initialized yet
  }
  return DEFAULT_DURATIONS[mode];
}

const initialWorkDuration = getDurationForMode('work');

const initialState: TimerState & { completedWorkCycles: number; targetEndTime: number | null } = {
  duration: initialWorkDuration,
  remainingSeconds: initialWorkDuration,
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
    set((state) => {
      const dur = getDurationForMode(state.mode);
      return {
        isRunning: false,
        targetEndTime: null,
        remainingSeconds: dur,
        duration: dur,
      };
    }),

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

  setMode: (mode) => {
    const dur = getDurationForMode(mode);
    set({
      mode,
      duration: dur,
      remainingSeconds: dur,
      isRunning: false,
      targetEndTime: null,
    });
  },

  setTimerState: (newState) => set((state) => ({ ...state, ...newState })),
  
  clearRemoteUpdateFlag: () => set({ isRemoteUpdate: false }),

  next: () => {
    const { mode, completedWorkCycles, currentCycle } = get();
    const nextCompleted =
      mode === 'work' ? completedWorkCycles + 1 : completedWorkCycles;
    const cyclesBeforeLongBreak = useSettingsStore.getState()?.cyclesBeforeLongBreak ?? 4;
    const nextMode = getNextMode(mode, nextCompleted, cyclesBeforeLongBreak);
    const dur = getDurationForMode(nextMode);
    set({
      mode: nextMode,
      duration: dur,
      remainingSeconds: dur,
      isRunning: false,
      targetEndTime: null,
      completedWorkCycles: nextCompleted,
      currentCycle: nextMode === 'work' ? currentCycle + 1 : currentCycle,
    });
  },
}));

// Subscribe to settings store to immediately update timer durations when user modifies them
useSettingsStore.subscribe((settings, prevSettings) => {
  const timer = useTimerStore.getState();
  if (!timer.isRunning) {
    if (timer.mode === 'work' && settings.workDuration !== prevSettings?.workDuration) {
      useTimerStore.setState({
        duration: settings.workDuration,
        remainingSeconds: settings.workDuration,
      });
    } else if (timer.mode === 'shortBreak' && settings.shortBreakDuration !== prevSettings?.shortBreakDuration) {
      useTimerStore.setState({
        duration: settings.shortBreakDuration,
        remainingSeconds: settings.shortBreakDuration,
      });
    } else if (timer.mode === 'longBreak' && settings.longBreakDuration !== prevSettings?.longBreakDuration) {
      useTimerStore.setState({
        duration: settings.longBreakDuration,
        remainingSeconds: settings.longBreakDuration,
      });
    }
  }
});
