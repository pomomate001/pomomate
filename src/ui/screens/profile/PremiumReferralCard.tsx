import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={[styles.board, shadows.md, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Premium side */}
      <Pressable style={[styles.half, { borderRightWidth: 1, borderRightColor: colors.border }]} onPress={onPremiumPress}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="star" size={24} color="#fff" />
        </View>
        <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: spacing.xs, textAlign: 'center' }]}>
          PomoMate Pro
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
          Tüm özellikleri aç
        </Text>
      </Pressable>

      {/* Referral side */}
      <Pressable style={styles.half} onPress={onReferralPress}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="gift" size={24} color="#fff" />
        </View>
        <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: spacing.xs, textAlign: 'center' }]}>
          Bedava Pro Kazan
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}>
          3 arkadaşını davet et
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  half: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  }
});
