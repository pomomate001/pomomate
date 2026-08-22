/**
 * Profile tab — user info, avatar, settings, premium card.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { Divider } from '../../components/Divider';
import { useUserStore } from '../../../state';
import { AvatarPicker } from './AvatarPicker';
import { PremiumReferralCard } from './PremiumReferralCard';
import { AdPlacement } from '../../ads';

interface ProfileScreenProps {
  onNavigateAppearance: () => void;
  onNavigateTimer: () => void;
  onNavigateSounds: () => void;
}

interface SettingRowProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function SettingRow({ icon, label, onPress }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.textSecondary} />
      <Text style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
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
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const handlePickAvatar = () => {
    // expo-image-picker integration happens in M05
  };

  const handleRemoveAvatar = () => {
    updateUser({ avatarUrl: undefined });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Avatar + name */}
      <AvatarPicker
        uri={user?.avatarUrl}
        name={user?.displayName}
        onPick={handlePickAvatar}
        onRemove={handleRemoveAvatar}
      />
      <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
        {user?.displayName ?? 'Kullanıcı'}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>
        {user?.email ?? ''}
      </Text>

      {/* Premium / Referral */}
      <PremiumReferralCard
        onPremiumPress={() => { /* RevenueCat paywall — M08 */ }}
        onReferralPress={() => { /* Referral flow — M08 */ }}
      />

      <Divider style={{ marginHorizontal: spacing.lg }} />

      {/* Settings */}
      <View style={[styles.settingsSection, shadows.sm, { backgroundColor: colors.card }]}>
        <SettingRow icon="color-palette-outline" label="Tema ve Görünüm" onPress={onNavigateAppearance} />
        <SettingRow icon="timer-outline" label="Çalışma / Mola Süreleri" onPress={onNavigateTimer} />
        <SettingRow icon="volume-medium-outline" label="Sesler" onPress={onNavigateSounds} />
        <SettingRow icon="notifications-outline" label="Bildirimler" onPress={() => {}} />
        <SettingRow icon="shield-checkmark-outline" label="Gizlilik" onPress={() => {}} />
        <SettingRow icon="information-circle-outline" label="Hakkında" onPress={() => {}} />
      </View>

      {/* Sign out */}
      <Pressable style={styles.signOut} onPress={() => { /* M08 sign-out */ }}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={[typography.bodyBold, { color: colors.error, marginLeft: spacing.sm }]}>
          Çıkış Yap
        </Text>
      </Pressable>

      <AdPlacement size="banner" />

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  settingsSection: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
});
