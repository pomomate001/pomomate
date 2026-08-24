/**
 * Referral Sheet — 3 friends invite → 1 month free Premium flow.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { useUserStore, useSettingsStore } from '../../../state';
import { referralService, ReferralReward } from '../../../services/monetization/ReferralService';

interface ReferralSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ReferralSheet({ visible, onClose }: ReferralSheetProps) {
  const colors = useColors();
  const user = useUserStore((s) => s.user);
  const setIsPremium = useSettingsStore((s) => s.setIsPremium);

  const [rewardStatus, setRewardStatus] = useState<ReferralReward>({
    earned: false,
    completedReferrals: 0,
    requiredReferrals: 3,
  });
  const [loading, setLoading] = useState(false);

  const referralCode = user?.id ? user.id.slice(0, 8).toUpperCase() : 'POMO-PRO';
  const referralLink = `https://pomomate.app/join?ref=${referralCode}`;

  useEffect(() => {
    if (visible) {
      loadRewardStatus();
    }
  }, [visible]);

  const loadRewardStatus = async () => {
    const status = await referralService.checkRewardEligibility();
    setRewardStatus(status);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'PomoMate — Birlikte Çalışalım!',
        message: `PomoMate ile birlikte odaklanalım! Benim davet kodumla kaydol ve çalışma odalarında buluşalım: ${referralLink}\n\nDavet Kodu: ${referralCode}`,
      });
    } catch (err) {
      Alert.alert('Hata', 'Paylaşım başlatılamadı.');
    }
  };

  const handleCopy = () => {
    Alert.alert('Kopyalandı!', `Davet Kodun: ${referralCode}\nArkadaşlarınla paylaşabilirsin!`);
  };

  const handleClaim = async () => {
    setLoading(true);
    const success = await referralService.claimReward();
    setLoading(false);

    if (success || rewardStatus.completedReferrals >= 3) {
      setIsPremium(true);
      Alert.alert('Tebrikler! 🎉', '1 Aylık Ücretsiz PomoMate Pro üyeliğiniz aktif edildi!', [
        { text: 'Harika!', onPress: onClose },
      ]);
    } else {
      Alert.alert('Yetersiz Davet', '1 ay ücretsiz Pro kazanmak için 3 arkadaşının kaydolması gerekir.');
    }
  };

  const completed = rewardStatus.completedReferrals;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="gift" size={32} color="#fff" />
        </View>
        <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
          Bedava Pro Kazan
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          3 arkadaşını PomoMate'e davet et, 1 ay boyunca tüm Pro özelliklerini ücretsiz kullan!
        </Text>
      </View>

      {/* Progress Cards */}
      <View style={[styles.progressCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          DAVET İLERLEMESİ ({completed} / 3)
        </Text>

        <View style={styles.stepsRow}>
          {[1, 2, 3].map((step) => {
            const isDone = completed >= step;
            return (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isDone ? colors.success : colors.surface,
                      borderColor: isDone ? colors.success : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : 'person-add'}
                    size={16}
                    color={isDone ? '#fff' : colors.textDisabled}
                  />
                </View>
                <Text style={[typography.caption, { color: isDone ? colors.success : colors.textDisabled, marginTop: 4 }]}>
                  {step}. Arkadaş
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Referral Code Box */}
      <View style={styles.codeSection}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          SENİN ÖZEL DAVET KODUN
        </Text>
        <Pressable
          onPress={handleCopy}
          style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        >
          <Text style={[typography.h3, { color: colors.primary, letterSpacing: 2 }]}>
            {referralCode}
          </Text>
          <View style={[styles.copyPill, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="copy-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[typography.captionBold, { color: colors.primary }]}>Kopyala</Text>
          </View>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <Button
          title="Arkadaşlarınla Paylaş"
          onPress={handleShare}
          icon={<Ionicons name="share-social" size={18} color={colors.textInverse} />}
          style={{ marginBottom: spacing.sm }}
        />

        {completed >= 3 && (
          <Button
            title="1 Ay Pro Ödülünü Al 🎉"
            onPress={handleClaim}
            variant="gradient"
            loading={loading}
            icon={<Ionicons name="trophy" size={18} color={colors.textInverse} />}
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeSection: {
    marginBottom: spacing.xl,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
