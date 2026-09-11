import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useRoomStore, useUserStore } from '../../../../state';
import { roomService } from '../../../../services/room';
import { useTranslation } from '../../../../i18n';
import { Avatar } from '../../../components/Avatar';

interface RoomSettingsPanelProps {
  roomId?: string;
}

export function RoomSettingsPanel({ roomId }: RoomSettingsPanelProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const roomSettings = useRoomStore((s: any) => s.roomSettings);
  const setRoomSettings = useRoomStore((s: any) => s.setRoomSettings);
  const currentRoom = useRoomStore((s: any) => s.currentRoom);
  const members = useRoomStore((s: any) => s.members);
  const currentUser = useUserStore((s: any) => s.user);

  const [kickingUserId, setKickingUserId] = useState<string | null>(null);

  const hostId = currentRoom?.hostId || currentUser?.id;

  // Build participants list (Host first, then other members)
  const hostParticipant = {
    userId: hostId,
    displayName: currentUser?.id === hostId
      ? (currentUser?.displayName || 'Siz')
      : (currentRoom?.hostName || t('rooms.hostRoleBadge')),
    avatarUrl: currentUser?.id === hostId ? currentUser?.avatarUrl : undefined,
    isHost: true,
  };

  const otherParticipants = members
    .filter((m: any) => m.userId !== hostId)
    .map((m: any) => ({
      userId: m.userId,
      displayName: m.displayName || 'Katılımcı',
      avatarUrl: m.avatarUrl,
      isHost: false,
    }));

  const allParticipants = [hostParticipant, ...otherParticipants];

  const toggleSetting = async (key: keyof typeof roomSettings) => {
    const updated = {
      ...roomSettings,
      [key]: !roomSettings[key],
    };
    setRoomSettings(updated);

    if (roomId) {
      // 1. Broadcast update to all room participants immediately
      void roomService.broadcastRoomSettings(roomId, updated);

      // 2. Persist in database
      await roomService.updateRoomSettings(roomId, updated);
    }
  };

  const handleKickParticipant = (participant: { userId: string; displayName: string }) => {
    if (!roomId) return;

    Alert.alert(
      t('rooms.kickParticipantConfirmTitle'),
      t('rooms.kickParticipantConfirmMsg', { name: participant.displayName }),
      [
        { text: t('common.cancel') || 'Vazgeç', style: 'cancel' },
        {
          text: t('rooms.kickParticipantBtn') || 'Odadan Çıkar',
          style: 'destructive',
          onPress: async () => {
            setKickingUserId(participant.userId);
            const res = await roomService.kickParticipant(roomId, participant.userId);
            setKickingUserId(null);

            if (!res.success) {
              Alert.alert(t('common.error') || 'Hata', res.error || 'Katılımcı çıkarılamadı.');
            } else {
              useRoomStore.getState().removeMember(participant.userId);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      bounces={true}
      overScrollMode="always"
    >
      {/* ─── Participant Management Section (Now at Top for Easy Access) ─── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[typography.h4, { color: colors.textPrimary }]}>
          {t('rooms.participantsSectionTitle')}
        </Text>
        <View style={[styles.badgeCount, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {allParticipants.length}
          </Text>
        </View>
      </View>

      <View style={styles.participantList}>
        {allParticipants.map((p) => (
          <View
            key={p.userId}
            style={[
              styles.participantRow,
              {
                backgroundColor: colors.surfaceVariant ? `${colors.surfaceVariant}80` : 'rgba(255,255,255,0.05)',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.participantProfile}>
              <Avatar uri={p.avatarUrl} name={p.displayName} size={36} />
              <View style={styles.participantMeta}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                  {p.displayName}
                </Text>
                <View style={styles.roleBadgeRow}>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: p.isHost
                          ? `${colors.primary}25`
                          : 'rgba(255, 255, 255, 0.08)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.overline,
                        { color: p.isHost ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {p.isHost ? t('rooms.hostRoleBadge') : t('rooms.memberRoleBadge')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {!p.isHost && (
              <Pressable
                style={({ pressed }) => [
                  styles.kickButton,
                  {
                    backgroundColor: `${colors.error}18`,
                    borderColor: `${colors.error}40`,
                    opacity: pressed || kickingUserId === p.userId ? 0.7 : 1,
                  },
                ]}
                disabled={kickingUserId === p.userId}
                onPress={() => handleKickParticipant(p)}
              >
                {kickingUserId === p.userId ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <>
                    <Ionicons name="person-remove-outline" size={14} color={colors.error} />
                    <Text style={[styles.kickButtonText, { color: colors.error }]}>
                      {t('rooms.kickParticipantBtn')}
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        ))}

        {otherParticipants.length === 0 && (
          <View style={styles.emptyParticipantsBox}>
            <Ionicons name="people-outline" size={24} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
              {t('rooms.noOtherParticipants')}
            </Text>
          </View>
        )}
      </View>

      {/* ─── Divider ─── */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* ─── Room Permissions Section ─── */}
      <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
        {t('rooms.settingsTitle')}
      </Text>
      
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        {t('rooms.settingsDesc')}
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="mic" size={20} color={colors.primary} />
          </View>
          <View style={styles.settingTextCol}>
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
          <View style={styles.settingTextCol}>
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
          <View style={styles.settingTextCol}>
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
          <View style={styles.settingTextCol}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl + 32,
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
    marginRight: spacing.sm,
  },
  settingTextCol: {
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  participantList: {
    gap: spacing.xs,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  participantProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  participantMeta: {
    flex: 1,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  kickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  kickButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyParticipantsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
});
