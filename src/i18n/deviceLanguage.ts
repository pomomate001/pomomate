import * as Localization from 'expo-localization';
import type { Language } from './types';

/**
 * Determines the default app language on first launch.
 *
 * Logic:
 * - If device region is Turkey ('TR'), device language is Turkish ('tr'),
 *   or device timezone is in Turkey ('Europe/Istanbul' / 'Asia/Istanbul'), default to 'tr'.
 * - For all other users worldwide outside Turkey, default to 'en'.
 */
export function resolveDeviceLanguage(): Language {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const primary = locales[0];
      const lang = primary.languageCode?.toLowerCase();
      const region = primary.regionCode?.toUpperCase();

      if (lang === 'tr' || region === 'TR') {
        return 'tr';
      }
    }

    // Secondary heuristic: calendar / timezone
    const calendars = Localization.getCalendars?.();
    const timeZone = calendars?.[0]?.timeZone;
    if (timeZone && (timeZone === 'Europe/Istanbul' || timeZone === 'Asia/Istanbul')) {
      return 'tr';
    }
  } catch {
    // If native modules error on unusual platforms, safely fallback
  }

  // Worldwide default
  return 'en';
}
