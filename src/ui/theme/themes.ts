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
}

export interface AppTheme {
  id: string;
  label: string;
  dark: boolean;
  colors: ThemeColors;
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

/**
 * Registry — add new themes here. UI pickers enumerate this map.
 * Example: themes.set('ocean', { id: 'ocean', ... })
 */
export const themes = new Map<string, AppTheme>([
  ['light', lightTheme],
  ['dark', darkTheme],
]);
