/**
 * Referral Sheet — 3 friends invite → 1 month free Premium flow.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useUserStore, useSettingsStore } from '../../../state';
import { referralService, ReferralStats } from '../../../services/monetization/ReferralService';
import { useTranslation } from '../../../i18n';

interface ReferralSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ReferralSheet({ visible, onClose }: ReferralSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const setIsPremium = useSettingsStore((s) => s.setIsPremium);

  const [stats, setStats] = useState<ReferralStats>({
    myCode: user?.referralCode || (user?.id ? user.id.slice(0, 8).toUpperCase() : 'POMO-PRO'),
    completedCount: 0,
    requiredCount: 3,
    claimedCount: 0,
    canClaim: false,
    hasUsedReferral: Boolean(user?.referredBy),
    premiumUntil: user?.premiumUntil || null,
    subscriptionTier: user?.subscriptionTier || 'free',
    friends: [],
  });

  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const referralCode = stats.myCode || (user?.id ? user.id.slice(0, 8).toUpperCase() : 'POMO-PRO');
  const referralLink = `https://pomomate.app/join?ref=${referralCode}`;

  const loadStats = async () => {
    const data = await referralService.getReferralStats();
    setStats(data);
    if (data.myCode && user && !user.referralCode) {
      updateUser({ referralCode: data.myCode });
    }
  };

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: t('referral.shareTitle'),
        message: t('referral.shareMessage', { link: referralLink, code: referralCode }),
      });
    } catch {
      // Ignored
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Platform fallback
    }
    Alert.alert(t('referral.copiedTitle'), t('referral.copiedMessage', { code: referralCode }));
  };

  const handleClaim = async () => {
    setLoading(true);
    const result = await referralService.claimReward();
    setLoading(false);

    if (result.success) {
      setIsPremium(true);
      updateUser({
        subscriptionTier: 'premium',
        premiumUntil: result.expiresAt || null,
      });
      await loadStats();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Ignored
      }
      Alert.alert(t('referral.claimSuccessTitle'), result.message, [
        { text: t('common.ok'), onPress: onClose },
      ]);
    } else {
      Alert.alert(t('referral.insufficientTitle'), result.message || t('referral.insufficientMessage'));
    }
  };

  const handleApplyManualCode = async () => {
    const clean = manualCode.trim().toUpperCase();
    if (!clean) return;

    setIsApplying(true);
    const res = await referralService.applyReferralCode(clean);
    setIsApplying(false);

    if (res.success) {
      setManualCode('');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Ignored
      }
      Alert.alert(
        t('referral.codeAppliedTitle'),
        t('referral.codeAppliedBody', { name: res.referrerName || 'Arkadaşın' })
      );
      await loadStats();
    } else {
      Alert.alert(t('common.error'), res.message);
    }
  };

  const completed = stats.completedCount;
  const friendSteps = [
    t('referral.friendStep1'),
    t('referral.friendStep2'),
    t('referral.friendStep3'),
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
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

          {stats.premiumUntil && new Date(stats.premiumUntil).getTime() > Date.now() && (
            <View style={[styles.activePill, { backgroundColor: `${colors.success}15`, borderColor: colors.success }]}>
              <Ionicons name="sparkles" size={14} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[typography.captionBold, { color: colors.success }]}>
                {t('referral.activeUntil', {
                  date: new Date(stats.premiumUntil).toLocaleDateString(),
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Progress Cards */}
        <View style={[styles.progressCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            {t('referral.progressHeader', { completed: Math.min(completed, 3) })}
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
        <View style={styles.actionSection}>
          <Button
            title={t('referral.shareBtn')}
            onPress={handleShare}
            icon={<Ionicons name="share-social" size={18} color={colors.textInverse} />}
            style={{ marginBottom: spacing.md }}
          />

          {stats.canClaim && (
            <Button
              title={t('referral.claimBtn')}
              onPress={handleClaim}
              variant="gradient"
              loading={loading}
              icon={<Ionicons name="trophy" size={18} color={colors.textInverse} />}
              style={{ marginBottom: spacing.md }}
            />
          )}
        </View>

        {/* Enter Friend's Code Option (If user hasn't used a referral yet) */}
        {!stats.hasUsedReferral && (
          <View style={[styles.manualSection, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              {t('referral.enterCodeHeader')}
            </Text>
            <View style={styles.manualInputRow}>
              <TextInput
                value={manualCode}
                onChangeText={(t) => setManualCode(t.toUpperCase())}
                placeholder={t('referral.enterCodePlaceholder')}
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[
                  styles.manualInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              />
              <Pressable
                onPress={handleApplyManualCode}
                disabled={!manualCode.trim() || isApplying}
                style={[
                  styles.applyBtn,
                  {
                    backgroundColor: manualCode.trim() && !isApplying ? colors.primary : colors.surface,
                    opacity: manualCode.trim() && !isApplying ? 1 : 0.6,
                  },
                ]}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[typography.captionBold, { color: manualCode.trim() ? '#fff' : colors.textDisabled }]}>
                    {t('referral.applyCodeBtn')}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Referred Friends List */}
        {stats.friends.length > 0 && (
          <View style={styles.friendsSection}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              {t('referral.invitedFriendsHeader')} ({stats.friends.length})
            </Text>
            {stats.friends.map((f) => (
              <View
                key={f.id}
                style={[
                  styles.friendRow,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.friendAvatar, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{f.displayName}</Text>
                  <Text style={[typography.caption, { color: colors.textDisabled }]}>
                    {new Date(f.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.sm,
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
    marginBottom: spacing.lg,
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
  actionSection: {
    marginBottom: spacing.md,
  },
  manualSection: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsSection: {
    marginBottom: spacing.lg,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
