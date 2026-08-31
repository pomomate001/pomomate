/**
 * BuddyAvatarBar — Shows host and guest avatars below the timer during a buddy session.
 *
 * Each avatar is tappable to open the emoji reaction panel.
 * Floating emoji animations appear above the sender's avatar.
 */
import React, { useState, useCallback } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import { EmojiReactionPanel } from './EmojiReactionPanel';
import { EmojiFloatingAnimation } from './EmojiFloatingAnimation';
import { useBuddyStore } from '../../../state';
import type { BuddyEmojiCode } from '../../../types';

interface BuddyAvatarBarProps {
  hostProfile: {
    displayName: string;
    avatarUrl?: string;
  };
  guestProfile: {
    displayName: string;
    avatarUrl?: string;
  } | null;
  myRole: 'host' | 'guest';
  onSendEmoji: (code: BuddyEmojiCode) => void;
  onLeave: () => void;
}

export function BuddyAvatarBar({
  hostProfile,
  guestProfile,
  myRole,
  onSendEmoji,
  onLeave,
}: BuddyAvatarBarProps) {
  const colors = useColors();
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const recentEmojis = useBuddyStore((s) => s.recentEmojis);

  // Get the latest emoji for animation
  const latestEmoji = recentEmojis.length > 0 ? recentEmojis[recentEmojis.length - 1] : null;

  const handleSelectEmoji = useCallback(
    (code: BuddyEmojiCode) => {
      onSendEmoji(code);
    },
    [onSendEmoji],
  );

  return (
    <View style={styles.container}>
      {/* Host Avatar */}
      <Pressable
        style={styles.avatarWrap}
        onPress={() => myRole === 'guest' && setShowEmojiPanel(true)}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri={hostProfile.avatarUrl}
            name={hostProfile.displayName}
            size={36}
          />
          {/* Crown icon for host */}
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="star" size={8} color="#FFF" />
          </View>
          {/* Emoji animation above host avatar */}
          {latestEmoji && myRole === 'host' && (
            <EmojiFloatingAnimation
              emojiCode={latestEmoji.emojiCode}
              animationKey={latestEmoji.id}
            />
          )}
        </View>
        <Text
          style={[typography.overline, { color: colors.textSecondary, marginTop: 2, fontSize: 9 }]}
          numberOfLines={1}
        >
          {hostProfile.displayName.split(' ')[0]}
        </Text>
      </Pressable>

      {/* Connection indicator */}
      <View style={styles.connectionLine}>
        <View style={[styles.dot, { backgroundColor: colors.success }]} />
        <View style={[styles.line, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        <View style={[styles.dot, { backgroundColor: guestProfile ? colors.success : colors.textDisabled }]} />
      </View>

      {/* Guest Avatar */}
      {guestProfile ? (
        <Pressable
          style={styles.avatarWrap}
          onPress={() => myRole === 'host' && setShowEmojiPanel(true)}
        >
          <View style={styles.avatarContainer}>
            <Avatar
              uri={guestProfile.avatarUrl}
              name={guestProfile.displayName}
              size={36}
            />
            {/* Emoji animation above guest avatar */}
            {latestEmoji && myRole === 'guest' && (
              <EmojiFloatingAnimation
                emojiCode={latestEmoji.emojiCode}
                animationKey={latestEmoji.id}
              />
            )}
          </View>
          <Text
            style={[typography.overline, { color: colors.textSecondary, marginTop: 2, fontSize: 9 }]}
            numberOfLines={1}
          >
            {guestProfile.displayName.split(' ')[0]}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.avatarWrap}>
          <View style={[styles.emptyAvatar, { borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="hourglass-outline" size={16} color={colors.textDisabled} />
          </View>
          <Text style={[typography.overline, { color: colors.textDisabled, marginTop: 2, fontSize: 9 }]}>
            Bekleniyor
          </Text>
        </View>
      )}

      {/* Leave button */}
      <Pressable
        style={[styles.leaveBtn, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}
        onPress={onLeave}
      >
        <Ionicons name="exit-outline" size={14} color={colors.error} />
      </Pressable>

      {/* Emoji Panel */}
      <EmojiReactionPanel
        visible={showEmojiPanel}
        onSelectEmoji={handleSelectEmoji}
        onClose={() => setShowEmojiPanel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    minWidth: 48,
  },
  avatarContainer: {
    position: 'relative',
  },
  roleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(15, 18, 28, 0.9)',
  },
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  line: {
    width: 24,
    height: 1.5,
    borderRadius: 1,
  },
  emptyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
