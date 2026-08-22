/**
 * AdMob service — banner and interstitial ads for free users.
 * 
 * Premium users never see ads.
 */
import MobileAds, {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { logger } from '../../utils/logger';
import { config } from '../../config';

const BANNER_AD_UNIT_ID = config.env === 'dev'
  ? TestIds.BANNER
  : 'YOUR_PROD_BANNER_AD_UNIT_ID';

const INTERSTITIAL_AD_UNIT_ID = config.env === 'dev'
  ? TestIds.INTERSTITIAL
  : 'YOUR_PROD_INTERSTITIAL_AD_UNIT_ID';

export class AdMobService {
  private initialized = false;
  private interstitial: InterstitialAd | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await MobileAds().initialize();
      this.initialized = true;
      logger.info('[AdMob] Initialized');

      // Preload interstitial
      this.loadInterstitial();
    } catch (err) {
      logger.warn('[AdMob] Initialization failed:', err);
    }
  }

  private loadInterstitial(): void {
    this.interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);
    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      logger.info('[AdMob] Interstitial loaded');
    });
    this.interstitial.load();
  }

  async showInterstitial(): Promise<void> {
    if (!this.interstitial) {
      logger.warn('[AdMob] Interstitial not loaded');
      return;
    }

    try {
      await this.interstitial.show();
      logger.info('[AdMob] Interstitial shown');
      // Reload for next time
      this.loadInterstitial();
    } catch (err) {
      logger.warn('[AdMob] Failed to show interstitial:', err);
    }
  }

  getBannerAdUnitId(): string {
    return BANNER_AD_UNIT_ID;
  }

  getBannerSize(): BannerAdSize {
    return BannerAdSize.BANNER;
  }
}

export const adMobService = new AdMobService();

// Re-export for UI components
export { BannerAd, BannerAdSize };
