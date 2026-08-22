/**
 * Default / fallback storage implementation.
 *
 * This file is what TypeScript resolves for `./storage`, and what Metro falls
 * back to when no platform-specific file (`storage.native.ts` /
 * `storage.web.ts`) matches the current target. It uses an in-memory Map so
 * the abstraction is always usable (e.g. during SSR or in tests) even without
 * a real persistence backend.
 */
import type { KeyValueStorage } from './types';

const memory = new Map<string, string>();

export const storage: KeyValueStorage = {
  async getItem(key) {
    return memory.has(key) ? (memory.get(key) as string) : null;
  },
  async setItem(key, value) {
    memory.set(key, value);
  },
  async removeItem(key) {
    memory.delete(key);
  },
  async clear() {
    memory.clear();
  },
};
