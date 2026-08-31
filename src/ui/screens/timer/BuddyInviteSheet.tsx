/**
 * BuddyInviteSheet — Transparent sheet to invite a friend for buddy timer session.
 *
 * Opens when the invite icon on the timer screen is tapped.
 * Shows friend list with "Invite" button for each friend.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { BottomSheet } from '../../components/BottomSheet';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { useFriendsStore, useUserStore, useBuddyStore } from '../../../state';
import { friendService } from '../../../services/friends/FriendService';
import { buddyService } from '../../../services/buddy';
import { useTranslation } from '../../../i18n';

interface BuddyInviteSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function BuddyInviteSheet({ visible, onClose }: BuddyInviteSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const friends = useFriendsStore((s) => s.friends);
  const activeSession = useBuddyStore((s) => s.activeSession);
  const isConnecting = useBuddyStore((s) => s.isConnecting);
  const [invitingId, setInvitingId] = React.useState<string | null>(null);

  useEffect(() => {
    if (visible && user?.id) {
      friendService.fetchFriends(user.id);
    }
  }, [visible, user?.id]);

  const handleInvite = async (friendId: string, friendName: string, friendAvatar?: string) => {
    if (!user?.id) return;
    setInvitingId(friendId);
    useBuddyStore.getState().setConnecting(true);

    try {
      // Create session if not already active
      let session = activeSession;
      if (!session) {
        session = await buddyService.createSession(user.id);
      }

      if (!session) {
        useBuddyStore.getState().setError('Oturum oluşturulamadı');
        return;
      }

      // Subscribe to session channel
      buddyService.subscribeToSession(session.id, user.id, {
        onGuestJoined: () => {
          useBuddyStore.getState().setBuddyProfile({
            userId: friendId,
            displayName: friendName,
            avatarUrl: friendAvatar,
          });
          onClose();
        },
        onInviteDeclined: () => {
          useBuddyStore.getState().setError('Davet reddedildi');
          useBuddyStore.getState().setConnecting(false);
        },
        onSessionEnded: () => {
          useBuddyStore.getState().endSession();
        },
      });

      // Send invite
      await buddyService.inviteFriend(session.id, friendId, {
        userId: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? undefined,
      });
    } finally {
      useBuddyStore.getState().setConnecting(false);
      setInvitingId(null);
    }
  };

  const handleEndSession = async () => {
    if (activeSession) {
      await buddyService.endSession(activeSession.id);
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
            {t('buddy.inviteFriend')}
          </Text>
        </View>

        {/* Active session info */}
        {activeSession && activeSession.status !== 'ended' && (
          <View style={[styles.activeSessionCard, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
            <Ionicons name="radio" size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary, marginLeft: spacing.xs, flex: 1 }]}>
              {t('buddy.activeSession')}
            </Text>
            <Button
              title={t('buddy.endSession')}
              size="sm"
              variant="ghost"
              onPress={handleEndSession}
              style={{ minHeight: 28 }}
            />
          </View>
        )}

        {/* Friend list */}
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={colors.textDisabled} />
            <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.sm, textAlign: 'center' }]}>
              {t('buddy.noFriends')}
            </Text>
          </View>
        ) : (
          friends.map((friend) => (
            <View
              key={friend.userId}
              style={[styles.friendRow, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            >
              <Avatar uri={friend.avatarUrl} name={friend.displayName} size={40} />
              <Text
                style={[typography.bodyBold, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}
                numberOfLines={1}
              >
                {friend.displayName}
              </Text>
              <Button
                title={invitingId === friend.userId ? '' : t('buddy.invite')}
                size="sm"
                onPress={() => handleInvite(friend.userId, friend.displayName, friend.avatarUrl)}
                disabled={isConnecting || !!activeSession?.guestId}
                icon={
                  invitingId === friend.userId ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons name="send" size={12} color="#FFF" />
                  )
                }
                style={{ minHeight: 32, paddingHorizontal: spacing.md }}
              />
            </View>
          ))
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeSessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
