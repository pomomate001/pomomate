import { getLocales } from 'expo-localization';
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';

const COMMON_COUNTRY_NAMES: Record<string, { tr: string; en: string }> = {
  TR: { tr: 'Türkiye', en: 'Turkey' },
  DE: { tr: 'Almanya', en: 'Germany' },
  US: { tr: 'Amerika Birleşik Devletleri', en: 'United States' },
  GB: { tr: 'Birleşik Krallık', en: 'United Kingdom' },
  FR: { tr: 'Fransa', en: 'France' },
  IT: { tr: 'İtalya', en: 'Italy' },
  ES: { tr: 'İspanya', en: 'Spain' },
  NL: { tr: 'Hollanda', en: 'Netherlands' },
  AZ: { tr: 'Azerbaycan', en: 'Azerbaijan' },
  RU: { tr: 'Rusya', en: 'Russia' },
  JP: { tr: 'Japonya', en: 'Japan' },
  KR: { tr: 'Güney Kore', en: 'South Korea' },
  CN: { tr: 'Çin', en: 'China' },
  BR: { tr: 'Brezilya', en: 'Brazil' },
  CA: { tr: 'Kanada', en: 'Canada' },
  AU: { tr: 'Avustralya', en: 'Australia' },
  UA: { tr: 'Ukrayna', en: 'Ukraine' },
  PL: { tr: 'Polonya', en: 'Poland' },
  AT: { tr: 'Avusturya', en: 'Austria' },
  CH: { tr: 'İsviçre', en: 'Switzerland' },
  BE: { tr: 'Belçika', en: 'Belgium' },
  SE: { tr: 'İsveç', en: 'Sweden' },
  NO: { tr: 'Norveç', en: 'Norway' },
  DK: { tr: 'Danimarka', en: 'Denmark' },
  FI: { tr: 'Finlandiya', en: 'Finland' },
};

/**
 * Converts a 2-letter ISO country code into a regional flag emoji (e.g. 'TR' -> 🇹🇷).
 */
export function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Returns localized country name (e.g. 'TR' -> 'Türkiye' in TR, 'Turkey' in EN).
 */
export function getCountryName(countryCode?: string | null, language: string = 'tr'): string {
  if (!countryCode) return language === 'en' ? 'Global' : 'Dünya';
  const upper = countryCode.toUpperCase();
  if (COMMON_COUNTRY_NAMES[upper]) {
    return language === 'en' ? COMMON_COUNTRY_NAMES[upper].en : COMMON_COUNTRY_NAMES[upper].tr;
  }
  try {
    if (typeof Intl !== 'undefined' && (Intl as any).DisplayNames) {
      const dn = new (Intl as any).DisplayNames([language === 'en' ? 'en' : 'tr'], { type: 'region' });
      const name = dn.of(upper);
      if (name) return name;
    }
  } catch {
    // fallback to code
  }
  return upper;
}

export class CountryService {
  /** Detect the user's country code from device locale. */
  detectCountryCode(): string | null {
    try {
      const locales = getLocales();
      if (locales && locales.length > 0) {
        return locales[0].regionCode?.toUpperCase() ?? (locales[0].languageCode?.toLowerCase() === 'tr' ? 'TR' : null);
      }
      return null;
    } catch (err) {
      logger.warn('[CountryService] detectCountryCode error:', err);
      return null;
    }
  }

  /** Save/update the user's country code in the database. */
  async setUserCountry(userId: string, countryCode: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ country_code: countryCode })
        .eq('id', userId);

      if (error) {
        logger.warn('[CountryService] setUserCountry error:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      logger.warn('[CountryService] setUserCountry error:', err);
      return false;
    }
  }

  /** Detect and save country code for user. Called on first login/registration. */
  async detectAndSave(userId: string): Promise<string | null> {
    const code = this.detectCountryCode();
    if (code) {
      await this.setUserCountry(userId, code);
    }
    return code;
  }
}

export const countryService = new CountryService();
