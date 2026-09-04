import { describe, it, expect, jest } from '@jest/globals';
import { resolveDeviceLanguage } from '../deviceLanguage';
import { getTagName } from '../../services/tags/TagService';
import { translate } from '../index';
import { getCountryFlag, getCountryName } from '../../services/location/CountryService';

const mockLocales = [{ languageCode: 'tr', regionCode: 'TR' }];
const mockCalendars = [{ timeZone: 'Europe/Istanbul' }];

jest.mock('expo-localization', () => ({
  getLocales: () => mockLocales,
  getCalendars: () => mockCalendars,
}));

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

  describe('Appearance & Sound settings and Paste localization', () => {
    it('translates common paste and clipboard strings', () => {
      expect(translate('common.paste', 'tr')).toBe('Yapıştır');
      expect(translate('common.paste', 'en')).toBe('Paste');
      expect(translate('common.pasteFromClipboard', 'tr')).toBe('Panodan Yapıştır');
      expect(translate('common.pasteFromClipboard', 'en')).toBe('Paste from Clipboard');
      expect(translate('friends.pastedAlertTitle', 'tr')).toBe('Yapıştırıldı');
      expect(translate('friends.pastedAlertTitle', 'en')).toBe('Pasted');
      expect(translate('buddy.waiting', 'tr')).toBe('Bekleniyor...');
      expect(translate('buddy.waiting', 'en')).toBe('Waiting...');
    });

    it('translates appearance options in both languages', () => {
      expect(translate('appearanceOptions.video_windmill.title', 'tr')).toBe('Rüzgar Değirmeni');
      expect(translate('appearanceOptions.video_windmill.title', 'en')).toBe('Windmill');
      expect(translate('appearanceOptions.theme_neon.title', 'tr')).toBe('Neon Cyber');
      expect(translate('appearanceOptions.theme_neon.title', 'en')).toBe('Cyber Neon');
      expect(translate('appearanceOptions.design_minimal.title', 'tr')).toBe('Minimalist');
      expect(translate('appearanceOptions.design_minimal.title', 'en')).toBe('Minimalist');
      expect(translate('appearanceOptions.none_effect.title', 'tr')).toBe('Sade');
      expect(translate('appearanceOptions.none_effect.title', 'en')).toBe('Minimal');
      expect(translate('appearanceOptions.cat_tail.title', 'tr')).toBe('Neşeli Kedi');
      expect(translate('appearanceOptions.cat_tail.title', 'en')).toBe('Playful Cat');
    });

    it('translates sound options in both languages', () => {
      expect(translate('soundOptions.notify_default.title', 'tr')).toBe('Dijital Melodi');
      expect(translate('soundOptions.notify_default.title', 'en')).toBe('Digital Melody');
      expect(translate('soundOptions.ambient_rain.title', 'tr')).toBe('Yağmur Sesi');
      expect(translate('soundOptions.ambient_rain.title', 'en')).toBe('Rain Sound');
      expect(translate('soundOptions.ambient_none.title', 'tr')).toBe('Ortam Sesi Yok');
      expect(translate('soundOptions.ambient_none.title', 'en')).toBe('No Ambient Sound');
    });

    it('translates friend request sharing and invite messages in both languages', () => {
      const shareUrl = 'https://pomomate.app/join?friend=test-123';
      const myCode = 'test-123';
      const trMessage = translate('friends.shareInviteMessage', 'tr', { url: shareUrl, code: myCode });
      const enMessage = translate('friends.shareInviteMessage', 'en', { url: shareUrl, code: myCode });

      expect(trMessage).toContain('Beni arkadaş olarak eklemek için');
      expect(trMessage).toContain('https://pomomate.app/join?friend=test-123');
      expect(enMessage).toContain('Tap the link below to add me as a friend');
      expect(enMessage).toContain('https://pomomate.app/join?friend=test-123');

      expect(translate('friends.requestSentSuccess', 'tr', { name: 'Ahmet' })).toBe('Ahmet kullanıcısına arkadaşlık isteği gönderildi!');
      expect(translate('friends.requestSentSuccess', 'en', { name: 'Ahmet' })).toBe('Friend request sent to Ahmet!');

      expect(translate('rooms.inviteToRoomTitle', 'tr')).toBe('Odaya Davet Et');
      expect(translate('rooms.inviteToRoomTitle', 'en')).toBe('Invite to Room');
    });
  });
});
