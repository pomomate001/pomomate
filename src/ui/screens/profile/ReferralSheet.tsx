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
import { useUserStore, useSettingsStore } from '../../../state';
import { referralService, ReferralReward } from '../../../services/monetization/ReferralService';
import { useTranslation } from '../../../i18n';

interface ReferralSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ReferralSheet({ visible, onClose }: ReferralSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
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
    let isMounted = true;
    if (visible) {
      referralService.checkRewardEligibility().then((status) => {
        if (isMounted) {
          setRewardStatus(status);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: t('referral.shareTitle'),
        message: t('referral.shareMessage', { link: referralLink, code: referralCode }),
      });
    } catch {
      Alert.alert(t('common.error'), t('rooms.shareMessageTitle'));
    }
  };

  const handleCopy = () => {
    Alert.alert(t('referral.copiedTitle'), t('referral.copiedMessage', { code: referralCode }));
  };

  const handleClaim = async () => {
    setLoading(true);
    const success = await referralService.claimReward();
    setLoading(false);

    if (success || rewardStatus.completedReferrals >= 3) {
      setIsPremium(true);
      Alert.alert(t('referral.claimSuccessTitle'), t('referral.claimSuccessMessage'), [
        { text: t('common.ok'), onPress: onClose },
      ]);
    } else {
      Alert.alert(t('referral.insufficientTitle'), t('referral.insufficientMessage'));
    }
  };

  const completed = rewardStatus.completedReferrals;
  const friendSteps = [
    t('referral.friendStep1'),
    t('referral.friendStep2'),
    t('referral.friendStep3'),
  ];

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
          {t('referral.title')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {t('referral.subtitle')}
        </Text>
      </View>

      {/* Progress Cards */}
      <View style={[styles.progressCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          {t('referral.progressHeader', { completed })}
        </Text>

        <View style={styles.stepsRow}>
          {[1, 2, 3].map((step, idx) => {
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
                  {friendSteps[idx]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Referral Code Box */}
      <View style={styles.codeSection}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('referral.yourCodeHeader')}
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
            <Text style={[typography.captionBold, { color: colors.primary }]}>{t('referral.copy')}</Text>
          </View>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <Button
          title={t('referral.shareBtn')}
          onPress={handleShare}
          icon={<Ionicons name="share-social" size={18} color={colors.textInverse} />}
          style={{ marginBottom: spacing.sm }}
        />

        {completed >= 3 && (
          <Button
            title={t('referral.claimBtn')}
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
