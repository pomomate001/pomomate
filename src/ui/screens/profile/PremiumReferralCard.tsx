/**
 * Premium + Hediye/Referral card — same board.
 *
 * Premium action → RevenueCat paywall (M08 wires it).
 * Gift box action → referral reward flow (M08).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { useSettingsStore } from '../../../state';

interface PremiumReferralCardProps {
  onPremiumPress: () => void;
  onReferralPress: () => void;
}

export function PremiumReferralCard({ onPremiumPress, onReferralPress }: PremiumReferralCardProps) {
  const isPremium = useSettingsStore((s) => s.isPremium);
  const colors = useColors();

  if (isPremium) return null;

  return (
    <View style={[styles.board, shadows.md, { backgroundColor: colors.card }]}>
      {/* Premium side */}
      <Pressable style={[styles.half, { borderRightWidth: 1, borderRightColor: colors.divider }]} onPress={onPremiumPress}>
        <Ionicons name="star" size={28} color={colors.warning} />
        <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {"Premium'a Geç"}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
          Reklamsız deneyim
        </Text>
      </Pressable>

      {/* Referral side */}
      <Pressable style={styles.half} onPress={onReferralPress}>
        <Text style={{ fontSize: 28 }}>🎁</Text>
        <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: spacing.xs, textAlign: 'center' }]}>
          3 Arkadaş Getir
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
          Ücretsiz Premium kazan
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  half: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
});
