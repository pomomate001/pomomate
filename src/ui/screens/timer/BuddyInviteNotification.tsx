/**
 * BuddyInviteNotification — In-app notification banner for incoming buddy invites.
 *
 * Slides down from the top when a buddy invite is received.
 * Shows host name and Accept/Decline buttons.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Avatar } from '../../components/Avatar';
import { useBuddyStore } from '../../../state';
import { useTranslation } from '../../../i18n';

interface BuddyInviteNotificationProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function BuddyInviteNotification({ onAccept, onDecline }: BuddyInviteNotificationProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { t } = useTranslation();
  const pendingInvite = useBuddyStore((s) => s.pendingInvite);
  const [slideAnim] = useState(() => new Animated.Value(-200));

  useEffect(() => {
    if (pendingInvite) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [pendingInvite, slideAnim]);

  if (!pendingInvite) return null;

  const { hostProfile } = pendingInvite;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          backgroundColor: 'rgba(15, 18, 28, 0.95)',
          borderColor: colors.primary,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Avatar uri={hostProfile.avatarUrl} name={hostProfile.displayName} size={40} />
        <View style={styles.textWrap}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
            {hostProfile.displayName}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {t('buddy.inviteMessage')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAccept}
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
        >
          <Ionicons name="checkmark" size={18} color="#FFF" />
          <Text style={[typography.captionBold, { color: '#FFF', marginLeft: 4 }]}>
            {t('buddy.accept')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDecline}
          style={[styles.actionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.2)' }]}
        >
          <Ionicons name="close" size={18} color={colors.error} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 999,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  textWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    flex: 1,
  },
});
