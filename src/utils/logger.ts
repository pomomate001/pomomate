/**
 * Minimal logger.
 *
 * A tiny wrapper around console that is silenced outside development. Keeps
 * logging centralised so it can later be routed to a remote sink (M07) without
 * touching call sites.
 */
import { isDev } from '../config';

type LogArgs = unknown[];

export const logger = {
  debug: (...args: LogArgs): void => {
    if (isDev) console.debug('[PomoMate]', ...args);
  },
  info: (...args: LogArgs): void => {
    if (isDev) console.info('[PomoMate]', ...args);
  },
  warn: (...args: LogArgs): void => {
    console.warn('[PomoMate]', ...args);
  },
  error: (...args: LogArgs): void => {
    console.error('[PomoMate]', ...args);
  },
};
