import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { useUserStore } from '../../../state';
import { AvatarPicker } from './AvatarPicker';
import { PremiumReferralCard } from './PremiumReferralCard';
import { PremiumPaywallSheet } from './PremiumPaywallSheet';
import * as ImagePicker from 'expo-image-picker';
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
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const [showPaywall, setShowPaywall] = React.useState(false);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateUser({ avatarUrl: result.assets[0].uri });
    }
  };

  const handleRemoveAvatar = () => {
    updateUser({ avatarUrl: undefined });
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
              onPick={handlePickAvatar}
              onRemove={handleRemoveAvatar}
            />
            <Text style={[typography.h3, { color: colors.textInverse, textAlign: 'center', marginTop: spacing.md }]}>
              {user?.displayName ?? 'Kullanıcı'}
            </Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center' }]}>
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          {/* Premium / Referral */}
          <PremiumReferralCard
            onPremiumPress={() => setShowPaywall(true)}
            onReferralPress={() => { /* Referral flow — M08 */ }}
          />

          {/* Settings */}
          <View style={[styles.settingsSection, shadows.sm, { backgroundColor: colors.surface }]}>
            <SettingRow icon="color-palette-outline" label="Tema ve Görünüm" onPress={onNavigateAppearance} />
            <SettingRow icon="timer-outline" label="Çalışma / Mola Süreleri" onPress={onNavigateTimer} />
            <SettingRow icon="volume-medium-outline" label="Sesler" onPress={onNavigateSounds} />
            <SettingRow icon="notifications-outline" label="Bildirimler" onPress={() => {}} />
            <SettingRow icon="shield-checkmark-outline" label="Gizlilik" onPress={() => {}} />
            <SettingRow icon="information-circle-outline" label="Hakkında" onPress={() => {}} hideBorder />
          </View>

          {/* Sign out */}
          <Pressable style={[styles.signOut, { backgroundColor: colors.surface }]} onPress={() => { /* M08 sign-out */ }}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[typography.bodyBold, { color: colors.error, marginLeft: spacing.sm }]}>
              Çıkış Yap
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
  contentWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
