import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(async (key: string, val: string) => {
      mockStorage[key] = val;
    }),
    getItem: jest.fn(async (key: string) => {
      return mockStorage[key] ?? null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    }),
  },
}));

jest.mock('../../auth/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

import { referralService } from '../ReferralService';

describe('ReferralService', () => {
  beforeEach(async () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    jest.clearAllMocks();
  });

  describe('extractReferralCode', () => {
    it('extracts plain uppercase code', () => {
      expect(referralService.extractReferralCode('E945C928')).toBe('E945C928');
      expect(referralService.extractReferralCode('  e945c928  ')).toBe('E945C928');
    });

    it('extracts referral code from pomomate.app URL', () => {
      expect(referralService.extractReferralCode('https://pomomate.app/join?ref=E945C928')).toBe('E945C928');
      expect(referralService.extractReferralCode('https://pomomate.app/join?foo=bar&ref=abc12345')).toBe('ABC12345');
    });

    it('extracts referral code from custom scheme URL', () => {
      expect(referralService.extractReferralCode('pomomate://join?ref=PRO12345')).toBe('PRO12345');
    });

    it('handles empty or invalid inputs gracefully', () => {
      expect(referralService.extractReferralCode('')).toBe('');
      expect(referralService.extractReferralCode(null)).toBe('');
      expect(referralService.extractReferralCode(undefined)).toBe('');
    });
  });

  describe('Pending Code Storage', () => {
    it('saves, retrieves and clears pending code', async () => {
      await referralService.savePendingCode('https://pomomate.app/join?ref=TESTCODE');
      const retrieved = await referralService.getPendingCode();
      expect(retrieved).toBe('TESTCODE');

      await referralService.clearPendingCode();
      const afterClear = await referralService.getPendingCode();
      expect(afterClear).toBeNull();
    });
  });
});
