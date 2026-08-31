import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useRoomStore } from '../../../../state';
import { useTranslation } from '../../../../i18n';

export function RoomSettingsPanel() {
  const colors = useColors();
  const { t } = useTranslation();
  const roomSettings = useRoomStore((s: any) => s.roomSettings);
  const setRoomSettings = useRoomStore((s: any) => s.setRoomSettings);

  const toggleSetting = (key: keyof typeof roomSettings) => {
    setRoomSettings({ [key]: !roomSettings[key] });
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        {t('rooms.settingsTitle')}
      </Text>
      
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {t('rooms.settingsDesc')}
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="mic" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{t('rooms.micUsageTitle')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.micUsageDesc')}</Text>
          </View>
        </View>
        <Switch
          value={roomSettings.allowMic}
          onValueChange={() => toggleSetting('allowMic')}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="videocam" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{t('rooms.camUsageTitle')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.camUsageDesc')}</Text>
          </View>
        </View>
        <Switch
          value={roomSettings.allowCamera}
          onValueChange={() => toggleSetting('allowCamera')}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{t('rooms.fileUploadTitle')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.fileUploadDesc')}</Text>
          </View>
        </View>
        <Switch
          value={roomSettings.allowFiles}
          onValueChange={() => toggleSetting('allowFiles')}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{t('rooms.chatAccessTitle')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.chatAccessDesc')}</Text>
          </View>
        </View>
        <Switch
          value={roomSettings.allowChat}
          onValueChange={() => toggleSetting('allowChat')}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
