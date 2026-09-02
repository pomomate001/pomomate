/**
 * RevenueCat service — subscription management.
 * 
 * Handles monthly/yearly premium plans and entitlement checks.
 */
import { Linking, Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';

export type SubscriptionTier = 'free' | 'premium';

export class RevenueCatService {
  private initialized = false;

  async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
      if (!apiKey) {
        logger.warn('[RevenueCat] Missing API key, skipping initialization');
        return;
      }

      await Purchases.configure({ apiKey, appUserID: userId });
      this.initialized = true;
      logger.info('[RevenueCat] Initialized for user:', userId);
    } catch (err) {
      logger.warn('[RevenueCat] Initialization failed:', err);
    }
  }

  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) return [];

      const packages = offerings.current.availablePackages;
      logger.info(`[RevenueCat] ${packages.length} packages available`);
      return packages;
    } catch (err) {
      logger.warn('[RevenueCat] Failed to get offerings:', err);
      return [];
    }
  }

  async purchasePackage(pkg: PurchasesPackage, userId?: string): Promise<boolean> {
    try {
      const result = await Purchases.purchasePackage(pkg);
      logger.info('[RevenueCat] Purchase successful');
      const isEntitled = this.checkEntitlement(result.customerInfo);
      if (isEntitled && userId) {
        await this.syncSupabaseTier(userId, 'premium');
      }
      return isEntitled;
    } catch (err) {
      logger.warn('[RevenueCat] Purchase failed:', err);
      return false;
    }
  }

  async restorePurchases(userId?: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      logger.info('[RevenueCat] Purchases restored');
      const isEntitled = this.checkEntitlement(customerInfo);
      if (isEntitled && userId) {
        await this.syncSupabaseTier(userId, 'premium');
      }
      return isEntitled;
    } catch (err) {
      logger.warn('[RevenueCat] Restore failed:', err);
      return false;
    }
  }

  async checkSubscription(): Promise<SubscriptionTier> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.checkEntitlement(customerInfo) ? 'premium' : 'free';
    } catch (err) {
      logger.warn('[RevenueCat] Failed to check subscription:', err);
      return 'free';
    }
  }

  public checkEntitlement(customerInfo: CustomerInfo): boolean {
    // Check if user has active "premium" entitlement
    return customerInfo.entitlements.active['premium'] !== undefined;
  }

  async getSubscriptionDetails(): Promise<{ planName: string; expirationDate: string | null } | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      
      if (!premiumEntitlement) return null;

      // Extract details
      const productId = premiumEntitlement.productIdentifier;
      let planName = 'Pro Plan';
      if (productId.includes('monthly')) planName = 'Pro Plan (Aylık)';
      else if (productId.includes('yearly') || productId.includes('annual')) planName = 'Pro Plan (Yıllık)';
      else planName = `Pro Plan (${productId})`;

      return {
        planName,
        expirationDate: premiumEntitlement.expirationDate, // ISO String
      };
    } catch (err) {
      logger.warn('[RevenueCat] Failed to get subscription details:', err);
      return null;
    }
  }

  async manageSubscriptions(): Promise<void> {
    try {
      // 1. Check if RevenueCat provides a direct management URL
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo?.managementURL) {
          const canOpen = await Linking.canOpenURL(customerInfo.managementURL);
          if (canOpen) {
            await Linking.openURL(customerInfo.managementURL);
            return;
          }
        }
      } catch (e) {
        logger.warn('[RevenueCat] Failed to fetch customerInfo for managementURL:', e);
      }

      // 2. Try native RevenueCat helper
      try {
        await Purchases.showManageSubscriptions();
        return;
      } catch (innerErr) {
        logger.warn('[RevenueCat] showManageSubscriptions failed, falling back to direct store link:', innerErr);
      }

      // 3. Fallback: Direct platform subscription URL
      if (Platform.OS === 'android') {
        const url = 'https://play.google.com/store/account/subscriptions?package=com.pomomate.app';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL('https://play.google.com/store/account/subscriptions');
        }
      } else if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (err) {
      logger.warn('[RevenueCat] Failed to open manage subscriptions:', err);
      // Last-ditch generic fallback
      try {
        if (Platform.OS === 'android') {
          await Linking.openURL('https://play.google.com/store/account/subscriptions');
        } else if (Platform.OS === 'ios') {
          await Linking.openURL('https://apps.apple.com/account/subscriptions');
        }
      } catch {
        // Ignored
      }
    }
  }

  async syncSupabaseTier(userId: string, tier: SubscriptionTier): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      if (error) {
        logger.warn('[RevenueCat] Failed to sync subscription_tier with Supabase:', error);
      } else {
        logger.info(`[RevenueCat] Synced subscription_tier (${tier}) to Supabase for user:`, userId);
      }
    } catch (err) {
      logger.warn('[RevenueCat] syncSupabaseTier exception:', err);
    }
  }

  async onCustomerInfoUpdate(
    handler: (info: CustomerInfo) => void,
  ): Promise<void> {
    Purchases.addCustomerInfoUpdateListener(handler);
  }
}

export const revenueCatService = new RevenueCatService();

