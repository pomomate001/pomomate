import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useFriendsStore, useUserStore } from '../../../state';
import { roomInviteService } from '../../../services/room';
import { useTranslation } from '../../../i18n';

interface RoomInviteSheetProps {
  visible: boolean;
  onClose: () => void;
  onSystemShare: () => void;
  inviteCode: string;
  roomId?: string;
  roomName?: string;
}

export function RoomInviteSheet({
  visible,
  onClose,
  onSystemShare,
  inviteCode,
  roomId,
  roomName,
}: RoomInviteSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const friends = useFriendsStore((s: any) => s.friends);
  const currentUser = useUserStore((s) => s.user);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert(t('rooms.copiedTitle'), t('rooms.codeCopiedAlert', { code: inviteCode }));
  };

  const handleCopyLink = async () => {
    const link = `https://pomomate.app/join?room=${inviteCode}`;
    await Clipboard.setStringAsync(link);
    Alert.alert(t('rooms.copiedTitle'), t('rooms.linkCopiedAlert'));
  };

  const handleInviteFriend = async (friendId: string, friendName: string) => {
    if (!roomId) {
      Alert.alert(t('common.error'), t('rooms.roomInfoError'));
      return;
    }

    setInvitingId(friendId);
    try {
      const success = await roomInviteService.inviteFriend(
        friendId,
        {
          id: roomId,
          name: roomName || t('rooms.defaultRoomName'),
          inviteCode,
        },
        {
          id: currentUser?.id || 'host',
          displayName: currentUser?.displayName || t('common.friend'),
          avatarUrl: currentUser?.avatarUrl,
        }
      );

      if (success) {
        Alert.alert(t('rooms.inviteSentTitle'), t('rooms.inviteSentAlert', { name: friendName }));
      } else {
        Alert.alert(t('rooms.inviteFailedTitle'), t('rooms.inviteFailedAlert'));
      }
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('rooms.inviteToRoomTitle')}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {t('rooms.inviteToRoomSubtitle')}
          </Text>
        </View>

        {/* Quick Code & Link Action Bar */}
        <View style={[styles.codeBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <View style={styles.codeTextContainer}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.roomJoinCodeLabel')}</Text>
            <Text style={[typography.h2, { color: colors.primary, letterSpacing: 3 }]}>{inviteCode}</Text>
          </View>
          <View style={styles.codeActions}>
            <Pressable
              style={[styles.smallActionBtn, { backgroundColor: colors.surface }]}
              onPress={handleCopyCode}
            >
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
              <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>{t('rooms.copyCode')}</Text>
            </Pressable>
            <Pressable
              style={[styles.smallActionBtn, { backgroundColor: colors.surface }]}
              onPress={handleCopyLink}
            >
              <Ionicons name="link-outline" size={18} color={colors.primary} />
              <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4 }]}>{t('rooms.copyLink')}</Text>
            </Pressable>
          </View>
        </View>

        <Button
          title={t('rooms.shareWithOtherApps')}
          variant="outline"
          icon={<Ionicons name="share-social-outline" size={20} color={colors.primary} />}
          onPress={async () => {
            await Clipboard.setStringAsync(inviteCode);
            onSystemShare();
            onClose();
          }}
          style={styles.systemShareBtn}
        />

        <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
          {t('rooms.inAppFriends')}
        </Text>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.userId || (item as any).id}
          renderItem={({ item }) => {
            const fId = item.userId || (item as any).id;
            return (
              <View style={[styles.friendItem, { borderBottomColor: colors.border }]}>
                <View style={styles.friendInfo}>
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {item.displayName?.charAt(0).toUpperCase() || 'P'}
                    </Text>
                  </View>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {item.displayName}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.inviteBtn,
                    { backgroundColor: invitingId === fId ? colors.surfaceVariant : `${colors.primary}20` },
                  ]}
                  onPress={() => handleInviteFriend(fId, item.displayName)}
                  disabled={invitingId === fId}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {invitingId === fId ? t('rooms.sendingInvite') : t('rooms.inviteBtn')}
                  </Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center', marginTop: spacing.md }]}>
              {t('rooms.noFriendsYet')}
            </Text>
          }
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    height: 480,
  },
  header: {
    marginBottom: spacing.md,
  },
  codeBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  codeTextContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  systemShareBtn: {
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
