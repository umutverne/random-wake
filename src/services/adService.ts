import {
  InterstitialAd,
  AdEventType,
  TestIds,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

// Ad Unit IDs - Production
const BANNER_AD_UNIT_ID = 'ca-app-pub-2225480937157277/1151489977';
const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-2225480937157277/8284213847';

// Use test IDs in development
const isDev = __DEV__;

export const AD_UNIT_IDS = {
  BANNER: isDev ? TestIds.BANNER : BANNER_AD_UNIT_ID,
  INTERSTITIAL: isDev ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID,
};

export const BANNER_SIZE = BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

// Interstitial Ad instance
let interstitialAd: InterstitialAd | null = null;
let isInterstitialLoaded = false;

/**
 * Load interstitial ad
 */
export const loadInterstitialAd = (): void => {
  if (interstitialAd) {
    return;
  }

  interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
    requestNonPersonalizedAdsOnly: true,
  });

  const unsubscribeLoaded = interstitialAd.addAdEventListener(
    AdEventType.LOADED,
    () => {
      isInterstitialLoaded = true;
      console.log('Interstitial ad loaded');
    }
  );

  const unsubscribeClosed = interstitialAd.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      isInterstitialLoaded = false;
      // Reload ad after it's closed
      interstitialAd?.load();
    }
  );

  const unsubscribeError = interstitialAd.addAdEventListener(
    AdEventType.ERROR,
    (error) => {
      console.error('Interstitial ad error:', error);
      isInterstitialLoaded = false;
    }
  );

  interstitialAd.load();

  // Return cleanup function (not used but good practice)
  return () => {
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
  };
};

/**
 * Show interstitial ad if loaded
 */
export const showInterstitialAd = async (): Promise<boolean> => {
  if (interstitialAd && isInterstitialLoaded) {
    try {
      await interstitialAd.show();
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }
  return false;
};

/**
 * Check if interstitial ad is ready
 */
export const isInterstitialReady = (): boolean => {
  return isInterstitialLoaded;
};
