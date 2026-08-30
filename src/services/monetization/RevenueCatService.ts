/**
 * RevenueCat service — subscription management.
 * 
 * Handles monthly/yearly premium plans and entitlement checks.
 */
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { logger } from '../../utils/logger';
import { config } from '../../config';

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

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const result = await Purchases.purchasePackage(pkg);
      logger.info('[RevenueCat] Purchase successful');
      return this.checkEntitlement(result.customerInfo);
    } catch (err) {
      logger.warn('[RevenueCat] Purchase failed:', err);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      logger.info('[RevenueCat] Purchases restored');
      return this.checkEntitlement(customerInfo);
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

  private checkEntitlement(customerInfo: CustomerInfo): boolean {
    // Check if user has active "premium" entitlement
    return customerInfo.entitlements.active['premium'] !== undefined;
  }

  async onCustomerInfoUpdate(
    handler: (info: CustomerInfo) => void,
  ): Promise<void> {
    Purchases.addCustomerInfoUpdateListener(handler);
  }
}

export const revenueCatService = new RevenueCatService();
