/**
 * Platform detection helpers.
 *
 * Demonstrates the `Platform.select` pattern for small, inline platform
 * branching (as opposed to the whole-file `.native.ts` / `.web.ts` split used
 * by the storage module). Prefer `Platform.select` for tiny differences and
 * the file split for larger, dependency-heavy divergence.
 */
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = isIOS || isAndroid;

/**
 * Human-readable name of the current platform, chosen via `Platform.select`.
 */
export const platformName: string = Platform.select({
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
  default: 'Unknown',
});
