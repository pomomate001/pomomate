/**
 * Settings store — user preferences for theme, timer design,
 * animation, sounds, and pomodoro durations.
 *
 * Extensible: new preference fields can be added without breaking
 * existing consumers.
 */
import { create } from 'zustand';

export type AmbientSoundMode = 'work' | 'break' | 'always' | 'off';

export interface SettingsState {
  // Appearance
  themeId: string;
  timerDesignId: string;
  backgroundEffectId: string;

  // Sounds (Notification & Ambient)
  soundEnabled: boolean;
  soundId: string;
  ambientSoundId: string;
  ambientSoundMode: AmbientSoundMode;

  // Pomodoro durations (seconds)
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;

  // Ad-free flag — toggled by subscription status (M08)
  isPremium: boolean;
}

interface SettingsActions {
  setThemeId: (id: string) => void;
  setTimerDesignId: (id: string) => void;
  setBackgroundEffectId: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundId: (id: string) => void;
  setAmbientSoundId: (id: string) => void;
  setAmbientSoundMode: (mode: AmbientSoundMode) => void;
  setWorkDuration: (seconds: number) => void;
  setShortBreakDuration: (seconds: number) => void;
  setLongBreakDuration: (seconds: number) => void;
  setCyclesBeforeLongBreak: (n: number) => void;
  setIsPremium: (premium: boolean) => void;
  reset: () => void;
}

const initialSettings: SettingsState = {
  themeId: 'dark',
  timerDesignId: 'circle',
  backgroundEffectId: 'none',
  soundEnabled: true,
  soundId: 'default',
  ambientSoundId: 'rain',
  ambientSoundMode: 'work',
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  cyclesBeforeLongBreak: 4,
  isPremium: false,
};

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  ...initialSettings,

  setThemeId: (themeId) => set({ themeId }),
  setTimerDesignId: (timerDesignId) => set({ timerDesignId }),
  setBackgroundEffectId: (backgroundEffectId) => set({ backgroundEffectId }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setSoundId: (soundId) => set({ soundId }),
  setAmbientSoundId: (ambientSoundId) => set({ ambientSoundId }),
  setAmbientSoundMode: (ambientSoundMode) => set({ ambientSoundMode }),
  setWorkDuration: (workDuration) => set({ workDuration }),
  setShortBreakDuration: (shortBreakDuration) => set({ shortBreakDuration }),
  setLongBreakDuration: (longBreakDuration) => set({ longBreakDuration }),
  setCyclesBeforeLongBreak: (cyclesBeforeLongBreak) => set({ cyclesBeforeLongBreak }),
  setIsPremium: (isPremium) => set({ isPremium }),
  reset: () => set(initialSettings),
}));
