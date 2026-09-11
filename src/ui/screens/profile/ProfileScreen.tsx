import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { useUserStore, useTagStore } from '../../../state';
import { AvatarPicker } from './AvatarPicker';
import { PremiumReferralCard } from './PremiumReferralCard';
import { PremiumPaywallSheet } from './PremiumPaywallSheet';
import { ReferralSheet } from './ReferralSheet';
import { AboutSheet } from './AboutSheet';
import { LanguageSheet } from './LanguageSheet';
import { OnboardingScreen } from '../onboarding';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../services/auth/supabaseClient';
import { logger } from '../../../utils/logger';
import { AdPlacement } from '../../ads';
import { useTranslation } from '../../../i18n';
import { TagSelectionSheet } from './TagSelectionSheet';
import { EditNameSheet } from './EditNameSheet';
import { EditBioSheet } from './EditBioSheet';
import { ManageSubscriptionSheet } from './ManageSubscriptionSheet';
import { tagService, getTagName } from '../../../services/tags';
import { countryService, getCountryFlag, getCountryName } from '../../../services/location';
import { useSettingsStore } from '../../../state/settingsStore';

interface ProfileScreenProps {
  onNavigateAppearance: () => void;
  onNavigateTimer: () => void;
  onNavigateSounds: () => void;
}

interface SettingRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  hideBorder?: boolean;
}

function SettingRow({ icon, label, onPress, color, hideBorder }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.settingRow, !hideBorder && { borderBottomColor: colors.divider, borderBottomWidth: 1 }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={color ?? colors.textSecondary} />
      </View>
      <Text style={[typography.body, { color: color ?? colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

export function ProfileScreen({
  onNavigateAppearance,
  onNavigateTimer,
  onNavigateSounds,
}: ProfileScreenProps) {
  const colors = useColors();
  const { t, language } = useTranslation();
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [showReferral, setShowReferral] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showLanguage, setShowLanguage] = React.useState(false);
  const [showTagSelection, setShowTagSelection] = React.useState(false);
  const [showEditName, setShowEditName] = React.useState(false);
  const [showEditBio, setShowEditBio] = React.useState(false);
  const [showManageSubscription, setShowManageSubscription] = React.useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false);
  const userTags = useTagStore((s) => s.userTags);
  const isPremium = useSettingsStore((s) => s.isPremium);

  const countryCode = user?.countryCode || countryService.detectCountryCode() || 'TR';
  const countryFlag = getCountryFlag(countryCode);
  const countryName = getCountryName(countryCode, language);

  // Load user tags
  React.useEffect(() => {
    if (user?.id) {
      tagService.fetchAllTags();
      tagService.fetchUserTags(user.id);
    }
  }, [user?.id]);

  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  const handlePickAvatar = async () => {
    if (!user?.id) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert(t('common.error'), 'Fotoğraf okunamadı.');
          return;
        }

        setIsUploadingAvatar(true);
        const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = asset.mimeType || (fileExt === 'png' ? 'image/png' : 'image/jpeg');
        const filePath = `${user.id}/avatar.${fileExt}`;
        const arrayBuffer = decode(asset.base64);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, arrayBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          logger.warn('[ProfileScreen] Avatar upload failed:', uploadError.message);
          Alert.alert(t('common.error'), uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Append timestamp for cache busting
        const publicUrlWithTimestamp = `${urlData.publicUrl}?t=${Date.now()}`;
        await updateUser({ avatarUrl: publicUrlWithTimestamp });
      }
    } catch (err: any) {
      logger.warn('[ProfileScreen] handlePickAvatar error:', err);
      Alert.alert(t('common.error'), err?.message || 'Avatar yüklenemedi.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    try {
      setIsUploadingAvatar(true);
      const { data: list } = await supabase.storage.from('avatars').list(user.id);
      if (list && list.length > 0) {
        const filesToRemove = list.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }
      await updateUser({ avatarUrl: undefined });
    } catch (err) {
      logger.warn('[ProfileScreen] handleRemoveAvatar error:', err);
      await updateUser({ avatarUrl: undefined });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <>
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.headerContent}>
            <AvatarPicker
              uri={user?.avatarUrl}
              name={user?.displayName}
              isLoading={isUploadingAvatar}
              onPick={handlePickAvatar}
              onRemove={handleRemoveAvatar}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }}>
              <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
                {user?.displayName ?? t('profile.userDefault')}
              </Text>
              <Pressable onPress={() => setShowEditName(true)} style={{ marginLeft: 8, padding: 4 }}>
                <Ionicons name="pencil" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              {user?.email ?? ''}
            </Text>

            {/* Country Badge (Automatic country tag outside the 8 editable hobby tags) */}
            <View style={[styles.countryBadge, { backgroundColor: `${colors.info}15`, borderColor: `${colors.info}35` }]}>
              <Text style={{ fontSize: 12, marginRight: 5 }}>{countryFlag}</Text>
              <Text style={[typography.captionBold, { color: colors.info, fontSize: 11 }]}>{countryName}</Text>
              <View style={[styles.countryAutoPill, { backgroundColor: `${colors.info}25` }]}>
                <Text style={{ color: colors.info, fontSize: 8, fontWeight: '700' }}>
                  {language === 'en' ? 'COUNTRY' : 'ÜLKE'}
                </Text>
              </View>
            </View>

            {/* Tags */}
            {userTags.length > 0 && (
              <Pressable onPress={() => setShowTagSelection(true)} style={styles.tagsContainer}>
                <View style={styles.tagsRow}>
                  {userTags.map((tag) => (
                    <View key={tag.id} style={[styles.profileTag, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]}>
                      {tag.icon && <Text style={{ fontSize: 10, marginRight: 3 }}>{tag.icon}</Text>}
                      <Text style={[typography.overline, { color: colors.primary, fontSize: 10 }]}>{getTagName(tag, language)}</Text>
                    </View>
                  ))}
                  <View style={[styles.profileTagEdit, { borderColor: `${colors.primary}40` }]}>
                    <Ionicons name="pencil" size={10} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            )}
            {userTags.length === 0 && (
              <Pressable onPress={() => setShowTagSelection(true)} style={[styles.addTagsBtn, { borderColor: colors.primary }]}>
                <Ionicons name="pricetag-outline" size={14} color={colors.primary} />
                <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>{t('tags.addTags')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.contentWrap}>
          {/* Benim Köşem (My Corner) — Bio Section */}
          <Pressable
            onPress={() => setShowEditBio(true)}
            style={[styles.bioSection, shadows.sm, { backgroundColor: colors.surface }]}
          >
            <View style={styles.bioHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
              <Text style={[typography.captionBold, { color: colors.primary, marginLeft: spacing.xs }]}>
                {t('profile.myCorner')}
              </Text>
              <View style={{ flex: 1 }} />
              <Ionicons name="pencil" size={14} color={colors.textDisabled} />
            </View>
            {user?.bio ? (
              <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.sm, fontStyle: 'italic' }]} numberOfLines={3}>
                {`"${user.bio}"`}
              </Text>
            ) : (
              <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.sm, fontStyle: 'italic' }]}>
                {t('profile.myCornerPlaceholder')}
              </Text>
            )}
          </Pressable>

          {/* Premium / Referral */}
          <PremiumReferralCard
            onPremiumPress={() => setShowPaywall(true)}
            onReferralPress={() => setShowReferral(true)}
          />

          {/* Settings */}
          <View style={[styles.settingsSection, shadows.sm, { backgroundColor: colors.surface }]}>
            <SettingRow 
              icon="star-outline" 
              label={t('profile.subscription')} 
              onPress={() => {
                if (isPremium) {
                  setShowManageSubscription(true);
                } else {
                  setShowPaywall(true);
                }
              }} 
            />
            <SettingRow 
              icon="gift-outline" 
              label={t('referral.title')} 
              onPress={() => setShowReferral(true)} 
            />
            <SettingRow icon="color-palette-outline" label={t('profile.appearance')} onPress={onNavigateAppearance} />
            <SettingRow icon="timer-outline" label={t('profile.timerSettings')} onPress={onNavigateTimer} />
            <SettingRow icon="volume-high-outline" label={t('profile.soundSettings')} onPress={onNavigateSounds} />
            <SettingRow icon="globe-outline" label={t('profile.language')} onPress={() => setShowLanguage(true)} />
            <SettingRow icon="shield-checkmark-outline" label={t('profile.privacyData')} onPress={() => alert(t('profile.privacyAlert'))} />
            <SettingRow icon="sparkles-outline" label={t('profile.onboardingTour')} onPress={() => setShowOnboardingModal(true)} />
            <SettingRow icon="information-circle-outline" label={t('profile.about')} onPress={() => setShowAbout(true)} hideBorder />
          </View>

          {/* Sign out */}
          <Pressable 
            style={[styles.signOut, { backgroundColor: `${colors.error}15` }]} 
            onPress={async () => { 
              await import('../../../services/auth').then(m => m.authService.signOut());
              useUserStore.getState().setUser(null);
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[typography.bodyBold, { color: colors.error, marginLeft: spacing.sm }]}>
              {t('profile.signOut')}
            </Text>
          </Pressable>

          <AdPlacement size="banner" />

          <View style={{ height: spacing.xxxl }} />
        </View>
      </ScrollView>

      <PremiumPaywallSheet 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />

      <ReferralSheet
        visible={showReferral}
        onClose={() => setShowReferral(false)}
      />

      <AboutSheet
        visible={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <LanguageSheet
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
      />

      <TagSelectionSheet
        visible={showTagSelection}
        onClose={() => setShowTagSelection(false)}
      />

      <EditNameSheet
        visible={showEditName}
        onClose={() => setShowEditName(false)}
      />

      <EditBioSheet
        visible={showEditBio}
        onClose={() => setShowEditBio(false)}
      />

      <ManageSubscriptionSheet
        visible={showManageSubscription}
        onClose={() => setShowManageSubscription(false)}
      />

      <Modal
        visible={showOnboardingModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowOnboardingModal(false)}
      >
        <OnboardingScreen onFinish={() => setShowOnboardingModal(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  countryAutoPill: {
    borderRadius: radius.full,
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tagsContainer: {
    marginTop: spacing.sm,
    maxWidth: '90%',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  profileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  profileTagEdit: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  contentWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  bioSection: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsSection: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
});
