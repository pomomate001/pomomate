/**
 * Typography presets.
 * Uses system fonts; a custom font can be swapped in later via expo-font.
 */
import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  subtitle: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  overline: { fontSize: 10, fontWeight: '700', lineHeight: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  timer: { fontSize: 64, fontWeight: '300', lineHeight: 72, fontVariant: ['tabular-nums'] },
  timerSmall: { fontSize: 48, fontWeight: '300', lineHeight: 56, fontVariant: ['tabular-nums'] },
} as const;

export type TypographyToken = keyof typeof typography;
