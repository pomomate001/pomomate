/**
 * Theme definitions — extensible theme system.
 *
 * New themes are added by creating a new ThemeColors object and registering
 * it in the `themes` map. The rest of the app resolves colours through
 * the active theme, so a single addition here propagates everywhere.
 */
import { palette } from './colors';

/** Semantic color slots every theme must fill. */
export interface ThemeColors {
  // Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Borders / dividers
  border: string;
  divider: string;

  // Timer modes
  timerWork: string;
  timerShortBreak: string;
  timerLongBreak: string;

  // Tab bar
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Overlay
  overlay: string;

  // Gradients (for backgrounds and special elements)
  gradientStart: string;
  gradientMiddle?: string;
  gradientEnd: string;
}

export interface AppTheme {
  id: string;
  label: string;
  dark: boolean;
  colors: ThemeColors;
  isPremium?: boolean;
}

/* ─── built-in themes ─── */

const lightColors: ThemeColors = {
  background: palette.grey50,
  surface: palette.white,
  surfaceVariant: palette.grey100,
  card: palette.white,

  textPrimary: palette.grey900,
  textSecondary: palette.grey600,
  textDisabled: palette.grey400,
  textInverse: palette.white,

  primary: palette.primary,
  primaryLight: palette.primaryLight,
  primaryDark: palette.primaryDark,
  accent: palette.accent,

  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,

  border: palette.grey300,
  divider: palette.grey200,

  timerWork: palette.work,
  timerShortBreak: palette.shortBreak,
  timerLongBreak: palette.longBreak,

  tabBarBackground: palette.white,
  tabBarActive: palette.primary,
  tabBarInactive: palette.grey500,

  overlay: palette.overlay,
  
  gradientStart: '#F5F5F5',
  gradientEnd: '#E0E0E0',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  card: '#1E1E1E',

  textPrimary: '#EEEEEE',
  textSecondary: '#AAAAAA',
  textDisabled: '#666666',
  textInverse: palette.grey900,

  primary: palette.primaryLight,
  primaryLight: '#B8B3FF',
  primaryDark: palette.primary,
  accent: palette.accentLight,

  success: '#66BB6A',
  warning: '#FFD54F',
  error: '#EF5350',
  info: '#42A5F5',

  border: '#333333',
  divider: '#2A2A2A',
  timerWork: palette.primaryLight,
  timerShortBreak: '#66BB6A',
  timerLongBreak: '#42A5F5',

  tabBarBackground: '#1E1E1E',
  tabBarActive: palette.primaryLight,
  tabBarInactive: '#888888',

  overlay: 'rgba(0,0,0,0.7)',
  
  gradientStart: '#1E1E1E',
  gradientEnd: '#121212',
};

export const lightTheme: AppTheme = {
  id: 'light',
  label: 'Açık',
  dark: false,
  colors: lightColors,
};

export const darkTheme: AppTheme = {
  id: 'dark',
  label: 'Koyu',
  dark: true,
  colors: darkColors,
};

const oceanColors: ThemeColors = {
  ...lightColors,
  background: '#E0F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#B2EBF2',
  card: '#FFFFFF',
  primary: '#00BCD4',
  primaryLight: '#4DD0E1',
  primaryDark: '#0097A7',
  gradientStart: '#E0F7FA',
  gradientEnd: '#80DEEA',
  timerWork: '#00BCD4',
  timerShortBreak: '#4CAF50',
  timerLongBreak: '#03A9F4',
};

export const oceanTheme: AppTheme = {
  id: 'ocean',
  label: 'Okyanus',
  dark: false,
  colors: oceanColors,
};

const sunsetColors: ThemeColors = {
  ...lightColors,
  background: '#FFF3E0',
  surface: '#FFFFFF',
  surfaceVariant: '#FFE0B2',
  card: '#FFFFFF',
  primary: '#FF9800',
  primaryLight: '#FFB74D',
  primaryDark: '#F57C00',
  gradientStart: '#FFCC80',
  gradientMiddle: '#FFAB40',
  gradientEnd: '#FF7043',
  timerWork: '#FF9800',
  timerShortBreak: '#4CAF50',
  timerLongBreak: '#2196F3',
};

export const sunsetTheme: AppTheme = {
  id: 'sunset',
  label: 'Gün Batımı',
  dark: false,
  colors: sunsetColors,
};

const roseColors: ThemeColors = {
  ...lightColors,
  background: '#FCE4EC',
  surface: '#FFFFFF',
  surfaceVariant: '#F8BBD0',
  card: '#FFFFFF',
  primary: '#E91E63',
  primaryLight: '#F06292',
  primaryDark: '#C2185B',
  gradientStart: '#FCE4EC',
  gradientEnd: '#F48FB1',
  timerWork: '#E91E63',
  timerShortBreak: '#8BC34A',
  timerLongBreak: '#03A9F4',
};

export const roseTheme: AppTheme = {
  id: 'rose',
  label: 'Gül',
  dark: false,
  colors: roseColors,
};

const darkRoseColors: ThemeColors = {
  ...darkColors,
  background: '#0F0C10',
  surface: '#1A141D',
  surfaceVariant: '#281E2C',
  card: '#1A141D',

  textPrimary: '#FCE4EC',
  textSecondary: '#C4A5B3',
  textDisabled: '#6E5562',
  textInverse: '#0F0C10',

  primary: '#F06292',
  primaryLight: '#F8BBD0',
  primaryDark: '#E91E63',
  accent: '#FF4081',

  success: '#81C784',
  warning: '#FFD54F',
  error: '#EF5350',
  info: '#4FC3F7',

  border: '#352538',
  divider: '#251828',
  timerWork: '#F06292',
  timerShortBreak: '#81C784',
  timerLongBreak: '#4FC3F7',

  tabBarBackground: '#150F18',
  tabBarActive: '#F06292',
  tabBarInactive: '#7E6070',

  overlay: 'rgba(15, 12, 16, 0.75)',

  gradientStart: '#1A141D',
  gradientMiddle: '#150F18',
  gradientEnd: '#0F0C10',
};

export const darkRoseTheme: AppTheme = {
  id: 'darkRose',
  label: 'Gece Gülü',
  dark: true,
  colors: darkRoseColors,
};

const neonColors: ThemeColors = {
  ...darkColors,
  background: '#000000',
  surface: '#111111',
  surfaceVariant: '#222222',
  card: '#111111',
  primary: '#00FF00',
  primaryLight: '#66FF66',
  primaryDark: '#00CC00',
  accent: '#FF00FF',
  gradientStart: '#000000',
  gradientEnd: '#1A001A',
  timerWork: '#00FF00',
  timerShortBreak: '#FF00FF',
  timerLongBreak: '#00FFFF',
};

export const neonTheme: AppTheme = {
  id: 'neon',
  label: 'Neon',
  dark: true,
  colors: neonColors,
  isPremium: true,
};

/**
 * Registry — add new themes here. UI pickers enumerate this map.
 */
export const themes = new Map<string, AppTheme>([
  ['light', lightTheme],
  ['dark', darkTheme],
  ['darkRose', darkRoseTheme],
  ['rose', roseTheme],
  ['ocean', oceanTheme],
  ['sunset', sunsetTheme],
  ['neon', neonTheme],
]);
