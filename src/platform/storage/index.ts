/**
 * Public entry point for the platform storage abstraction.
 *
 * Consumers simply `import { storage } from '@/platform/storage'` and the
 * correct platform implementation is wired up by Metro at build time.
 */
export type { KeyValueStorage } from './types';
export { storage } from './storage';
