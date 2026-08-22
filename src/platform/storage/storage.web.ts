/**
 * Web storage implementation — backed by the browser's localStorage.
 *
 * Metro resolves this file automatically on web because of the `.web.ts`
 * suffix. The API is wrapped in Promises to satisfy the async
 * `KeyValueStorage` contract shared with the native implementation.
 */
import type { KeyValueStorage } from './types';

function getLocalStorage(): globalThis.Storage | null {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

export const storage: KeyValueStorage = {
  async getItem(key) {
    return getLocalStorage()?.getItem(key) ?? null;
  },
  async setItem(key, value) {
    getLocalStorage()?.setItem(key, value);
  },
  async removeItem(key) {
    getLocalStorage()?.removeItem(key);
  },
  async clear() {
    getLocalStorage()?.clear();
  },
};
