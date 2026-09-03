import { useCallback } from 'react';
import { useSettingsStore } from '../state/settingsStore';
import { tr } from './translations/tr';
import { en } from './translations/en';
import type { Language, TranslationKey } from './types';
import { resolveDeviceLanguage } from './deviceLanguage';

export * from './types';
export { resolveDeviceLanguage };

const translations = {
  tr,
  en,
};

/**
 * Resolves a dot-notation key in the translations dictionary.
 * Supports placeholder interpolation like `{code}`, `{name}`, `{date}`, `{count}`, etc.
 */
export function translate(
  key: TranslationKey,
  language: Language = 'tr',
  params?: Record<string, string | number>
): string {
  const dict = translations[language] || translations.tr;
  const keys = key.split('.');
  
  let result: any = dict;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Fallback to Turkish if key is missing in target language
      let fallbackResult: any = translations.tr;
      for (const fk of keys) {
        if (fallbackResult && typeof fallbackResult === 'object' && fk in fallbackResult) {
          fallbackResult = fallbackResult[fk];
        } else {
          return key;
        }
      }
      result = fallbackResult;
      break;
    }
  }

  if (typeof result !== 'string') {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
      return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }, result);
  }

  return result;
}

/**
 * Static translation helper using current state.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const language = useSettingsStore.getState().language || resolveDeviceLanguage();
  return translate(key, language, params);
}

/**
 * React hook for consuming translations and changing language.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language) || resolveDeviceLanguage();
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const tFunc = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(key, language, params);
    },
    [language]
  );

  return {
    t: tFunc,
    language,
    setLanguage,
  };
}
