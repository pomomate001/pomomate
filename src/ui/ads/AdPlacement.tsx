/**
 * Ad placement component — AdMob banner integration.
 *
 * Rules:
 *  - Never overlays timer, task interaction, or room controls.
 *  - Stays within designated zones (bottom banner, between sections).
 *  - Premium users see nothing.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../theme/spacing';
import { useSettingsStore } from '../../state';
import { BannerAd, BannerAdSize, adMobService } from '../../services/monetization';

interface AdPlacementProps {
  size?: 'banner' | 'medium';
  style?: ViewStyle;
}

export function AdPlacement({ size = 'banner', style }: AdPlacementProps) {
  const isPremium = useSettingsStore((s) => s.isPremium);

  // Premium users — no ads
  if (isPremium) return null;

  const adSize = size === 'banner' ? BannerAdSize.BANNER : BannerAdSize.MEDIUM_RECTANGLE;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adMobService.getBannerAdUnitId()}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
});
