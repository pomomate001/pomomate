/**
 * Pomodoro business logic (platform-agnostic).
 *
 * Pure constants and functions describing the pomodoro cycle. No timers, no UI,
 * no side effects — this is safe to share across mobile, web and tests.
 */
import type { TimerMode } from '../types';

/** Default interval lengths in seconds. */
export const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/** Number of work intervals before a long break. */
export const CYCLES_BEFORE_LONG_BREAK = 4;

/**
 * Given the current mode and completed work-cycle count, returns the next
 * mode in a standard pomodoro sequence.
 */
export function getNextMode(
  current: TimerMode,
  completedWorkCycles: number,
): TimerMode {
  if (current === 'work') {
    return completedWorkCycles % CYCLES_BEFORE_LONG_BREAK === 0
      ? 'longBreak'
      : 'shortBreak';
  }
  return 'work';
}

/** Formats a number of seconds as `mm:ss`. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
