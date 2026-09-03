import { describe, it, expect } from '@jest/globals';
import { getNextMode, formatDuration } from '../pomodoro';

describe('Pomodoro Core Logic', () => {
  describe('getNextMode', () => {
    it('should switch from work to shortBreak if cycles < 4', () => {
      expect(getNextMode('work', 1)).toBe('shortBreak');
      expect(getNextMode('work', 2)).toBe('shortBreak');
      expect(getNextMode('work', 3)).toBe('shortBreak');
    });

    it('should switch from work to longBreak if cycles is a multiple of 4', () => {
      expect(getNextMode('work', 4)).toBe('longBreak');
      expect(getNextMode('work', 8)).toBe('longBreak');
    });

    it('should respect custom cyclesBeforeLongBreak parameter', () => {
      expect(getNextMode('work', 2, 2)).toBe('longBreak');
      expect(getNextMode('work', 3, 3)).toBe('longBreak');
      expect(getNextMode('work', 2, 3)).toBe('shortBreak');
    });

    it('should switch to work after any break', () => {
      expect(getNextMode('shortBreak', 1)).toBe('work');
      expect(getNextMode('longBreak', 4)).toBe('work');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds into mm:ss', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(59)).toBe('00:59');
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(1500)).toBe('25:00');
      expect(formatDuration(3599)).toBe('59:59');
      expect(formatDuration(3600)).toBe('60:00');
    });

    it('handles negative or decimal values safely', () => {
      expect(formatDuration(-10)).toBe('00:00');
      expect(formatDuration(25.5)).toBe('00:25');
    });
  });
});
