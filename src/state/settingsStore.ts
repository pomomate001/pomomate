/**
 * Settings store — user preferences for theme, timer design,
 * animation, sounds, and pomodoro durations.
 *
 * Extensible: new preference fields can be added without breaking
 * existing consumers.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../platform/storage';

export type AmbientSoundMode = 'work' | 'break' | 'always' | 'off';

export interface SettingsState {
  // Localization
  language: 'tr' | 'en';

  // Appearance
  themeId: string;
  timerDesignId: string;
  backgroundEffectId: string;
  workAnimationId: string;
  breakAnimationId: string;

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
  setLanguage: (language: 'tr' | 'en') => void;
  setThemeId: (id: string) => void;
  setTimerDesignId: (id: string) => void;
  setBackgroundEffectId: (id: string) => void;
  setWorkAnimationId: (id: string) => void;
  setBreakAnimationId: (id: string) => void;
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
  language: 'tr',
  themeId: 'dark',
  timerDesignId: 'circle',
  backgroundEffectId: 'none',
  workAnimationId: 'cat_tail',
  breakAnimationId: 'cat_table_right',
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

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialSettings,

      setLanguage: (language) => set({ language }),
      setThemeId: (themeId) => set({ themeId }),
      setTimerDesignId: (timerDesignId) => set({ timerDesignId }),
      setBackgroundEffectId: (backgroundEffectId) => set({ backgroundEffectId }),
      setWorkAnimationId: (workAnimationId) => set({ workAnimationId }),
      setBreakAnimationId: (breakAnimationId) => set({ breakAnimationId }),
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
    }),
    {
      name: 'pomomate-settings',
      storage: createJSONStorage(() => storage),
    }
  )
);
