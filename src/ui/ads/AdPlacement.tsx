/**
 * Ad placement component — responsive placeholder.
 *
 * M02 only prepares the UI slot. The actual ad SDK integration
 * happens in M08. Premium users see nothing.
 *
 * Rules:
 *  - Never overlays timer, task interaction, or room controls.
 *  - Stays within designated zones (bottom banner, between sections).
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { useSettingsStore } from '../../state';

type AdSize = 'banner' | 'medium';

interface AdPlacementProps {
  size?: AdSize;
  style?: ViewStyle;
}

const adHeights: Record<AdSize, number> = {
  banner: 50,
  medium: 100,
};

export function AdPlacement({ size = 'banner', style }: AdPlacementProps) {
  const isPremium = useSettingsStore((s) => s.isPremium);
  const colors = useColors();

  // Premium users — no ads
  if (isPremium) return null;

  return (
    <View
      style={[
        styles.container,
        { height: adHeights[size], backgroundColor: colors.surfaceVariant, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.textDisabled }]}>Reklam Alanı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  label: { fontSize: 11 },
});
