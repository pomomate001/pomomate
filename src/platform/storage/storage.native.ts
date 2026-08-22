/**
 * Mobile (iOS/Android) storage implementation — backed by AsyncStorage.
 *
 * Metro resolves this file automatically on native platforms because of the
 * `.native.ts` suffix. Web builds pick up `storage.web.ts` instead, and any
 * other target falls back to `storage.ts`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStorage } from './types';

export const storage: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  clear: () => AsyncStorage.clear(),
};
