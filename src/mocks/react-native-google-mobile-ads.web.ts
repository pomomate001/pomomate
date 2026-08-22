// Web stub – native module not available on web platform
const noOpAsync = async () => {};
export default { initialize: noOpAsync };
export const BannerAd = () => null;
export const BannerAdSize = { BANNER: 'BANNER', LEADERBOARD: 'LEADERBOARD' };
export const InterstitialAd = { createForAdRequest: () => ({ load: () => {}, show: () => {}, addAdEventListener: () => {} }) };
export const AdEventType = { LOADED: 'LOADED', ERROR: 'ERROR', CLOSED: 'CLOSED' };
export const TestIds = { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' };
export const GAMBannerAd = () => null;
export const NativeAd = () => null;
