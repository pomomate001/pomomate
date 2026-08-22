/**
 * Platform-agnostic key/value storage contract.
 *
 * Every platform implementation (mobile via AsyncStorage, web via
 * localStorage) conforms to this async interface so business logic can depend
 * on the abstraction rather than a concrete platform API.
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
