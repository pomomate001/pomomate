/**
 * ID helpers.
 *
 * Lightweight client-side ID generation for optimistic UI (e.g. a task created
 * locally before the backend assigns the canonical id in M03). Uses the
 * platform crypto.randomUUID when available and falls back to a simple
 * timestamp+random scheme otherwise.
 */
export function generateId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
