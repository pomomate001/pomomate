import { getLocales } from 'expo-localization';
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';

export class CountryService {
  /** Detect the user's country code from device locale. */
  detectCountryCode(): string | null {
    try {
      const locales = getLocales();
      if (locales && locales.length > 0) {
        return locales[0].regionCode ?? null;
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
