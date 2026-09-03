import { describe, it, expect, jest } from '@jest/globals';

const mockLocales = [{ languageCode: 'tr', regionCode: 'TR' }];
const mockCalendars = [{ timeZone: 'Europe/Istanbul' }];

jest.mock('expo-localization', () => ({
  getLocales: () => mockLocales,
  getCalendars: () => mockCalendars,
}));

import { resolveDeviceLanguage } from '../deviceLanguage';
import { getTagName } from '../../services/tags/TagService';
import { translate } from '../index';

describe('i18n and Tags Localized Handling', () => {
  describe('resolveDeviceLanguage', () => {
    it('returns tr when device is in Turkey (region TR)', () => {
      mockLocales[0] = { languageCode: 'tr', regionCode: 'TR' };
      expect(resolveDeviceLanguage()).toBe('tr');
    });

    it('returns tr when language is Turkish even in another region', () => {
      mockLocales[0] = { languageCode: 'tr', regionCode: 'DE' };
      expect(resolveDeviceLanguage()).toBe('tr');
    });

    it('returns en when user is outside Turkey (e.g. US, en)', () => {
      mockLocales[0] = { languageCode: 'en', regionCode: 'US' };
      mockCalendars[0] = { timeZone: 'America/New_York' };
      expect(resolveDeviceLanguage()).toBe('en');
    });

    it('returns en for European users with non-Turkish locale (e.g. DE, de)', () => {
      mockLocales[0] = { languageCode: 'de', regionCode: 'DE' };
      mockCalendars[0] = { timeZone: 'Europe/Berlin' };
      expect(resolveDeviceLanguage()).toBe('en');
    });
  });

  describe('getTagName - interest / hobby tag localization', () => {
    const mathTag = {
      id: 'tag-1',
      nameTr: 'Matematik',
      nameEn: 'Mathematics',
    };

    it('returns Turkish tag name when language is tr', () => {
      expect(getTagName(mathTag, 'tr')).toBe('Matematik');
    });

    it('returns English tag name when language is en', () => {
      expect(getTagName(mathTag, 'en')).toBe('Mathematics');
    });

    it('falls back gracefully to Turkish if English name is empty', () => {
      const tagWithoutEn = { id: 'tag-2', nameTr: 'YKS', nameEn: '' };
      expect(getTagName(tagWithoutEn, 'en')).toBe('YKS');
    });

    it('handles null or undefined tag safely', () => {
      expect(getTagName(null, 'en')).toBe('');
      expect(getTagName(undefined, 'tr')).toBe('');
    });
  });

  describe('Translations for recurrence and discover refresh', () => {
    it('translates discover.refresh properly in both languages', () => {
      expect(translate('discover.refresh', 'tr')).toBe('Keşfeti Yenile');
      expect(translate('discover.refresh', 'en')).toBe('Refresh Discover');
    });

    it('translates task recurrence badges in both languages', () => {
      expect(translate('tasks.recurrenceDaily', 'tr')).toBe('Her Gün');
      expect(translate('tasks.recurrenceDaily', 'en')).toBe('Daily');

      expect(translate('tasks.recurrenceWeekdays', 'tr')).toBe('Hafta İçi');
      expect(translate('tasks.recurrenceWeekdays', 'en')).toBe('Weekdays');

      expect(translate('tasks.recurrenceWeekends', 'tr')).toBe('Hafta Sonu');
      expect(translate('tasks.recurrenceWeekends', 'en')).toBe('Weekends');
    });
  });

  describe('Country Badges and Flags', () => {
    // Import helpers
    const { getCountryFlag, getCountryName } = require('../../services/location/CountryService');

    it('converts ISO codes to flag emojis', () => {
      expect(getCountryFlag('TR')).toBe('🇹🇷');
      expect(getCountryFlag('DE')).toBe('🇩🇪');
      expect(getCountryFlag('US')).toBe('🇺🇸');
      expect(getCountryFlag(null)).toBe('🌍');
      expect(getCountryFlag(undefined)).toBe('🌍');
    });

    it('returns localized country names', () => {
      expect(getCountryName('TR', 'tr')).toBe('Türkiye');
      expect(getCountryName('TR', 'en')).toBe('Turkey');
      expect(getCountryName('DE', 'tr')).toBe('Almanya');
      expect(getCountryName('DE', 'en')).toBe('Germany');
      expect(getCountryName('US', 'en')).toBe('United States');
    });
  });
});
