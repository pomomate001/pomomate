/**
 * Color palette — single source of truth for the app.
 * Theme system (light / dark / custom) references these tokens.
 */

export const palette = {
  // Brand
  primary: '#6C63FF',
  primaryLight: '#9D97FF',
  primaryDark: '#4A42DB',

  // Accent
  accent: '#FF6584',
  accentLight: '#FF8FA3',
  accentSecondary: '#00D2D3',

  // Semantic
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Special Effects
  shimmer: 'rgba(255,255,255,0.3)',

  // Timer modes
  work: '#6C63FF',
  shortBreak: '#4CAF50',
  longBreak: '#2196F3',

  // Transparent
  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof palette;
