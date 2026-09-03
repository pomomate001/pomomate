import { describe, it, expect, jest } from '@jest/globals';
import { revenueCatService } from '../RevenueCatService';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    getCustomerInfo: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
  },
}));

jest.mock('../../auth/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('RevenueCatService - isUserPro expiration & revocation logic', () => {
  it('returns true when RevenueCat has an active premium entitlement', () => {
    const isPro = revenueCatService.isUserPro(
      { subscriptionTier: 'free', premiumUntil: null },
      'premium'
    );
    expect(isPro).toBe(true);
  });

  it('PREVENTS PERMANENT PRO: returns false when RevenueCat is free and Supabase has premium but null premiumUntil', () => {
    // This was the exact bug: store subscriptions set premium_until to null.
    // When the store subscription expires, rcTier becomes 'free'.
    // isUserPro must NOT assume null means lifetime!
    const isPro = revenueCatService.isUserPro(
      { subscriptionTier: 'premium', premiumUntil: null },
      'free'
    );
    expect(isPro).toBe(false);
  });

  it('returns false when RevenueCat is free and promotional premiumUntil has expired in the past', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
    const isPro = revenueCatService.isUserPro(
      { subscriptionTier: 'premium', premiumUntil: pastDate },
      'free'
    );
    expect(isPro).toBe(false);
  });

  it('returns true when RevenueCat is free but referral/gift premiumUntil is still active in the future', () => {
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 days ahead
    const isPro = revenueCatService.isUserPro(
      { subscriptionTier: 'premium', premiumUntil: futureDate },
      'free'
    );
    expect(isPro).toBe(true);
  });

  it('returns false for standard free user', () => {
    const isPro = revenueCatService.isUserPro(
      { subscriptionTier: 'free', premiumUntil: null },
      'free'
    );
    expect(isPro).toBe(false);
  });

  it('handles null/undefined user safely', () => {
    expect(revenueCatService.isUserPro(null, 'free')).toBe(false);
    expect(revenueCatService.isUserPro(undefined, 'free')).toBe(false);
    expect(revenueCatService.isUserPro(null, 'premium')).toBe(true);
  });
});
