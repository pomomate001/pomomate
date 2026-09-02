import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated } from 'react-native';
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

  // Animations
  const [animValue] = useState(() => new Animated.Value(guestProfile ? 1 : 0));

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: guestProfile ? 1 : 0,
      duration: 600,
      useNativeDriver: false, // width/margin animation requires false
    }).start();
  }, [guestProfile, animValue]);

  // Interpolations
  const gapSize = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 12], // starts far, moves closer
  });

  const lineWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 12], // line shrinks
  });

  const lineOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.15],
  });

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
      <Animated.View style={[styles.innerContainer, { columnGap: gapSize }]}>
        {/* Host Avatar */}
        <Pressable
          style={styles.avatarWrap}
          onPress={() => myRole === 'guest' && setShowEmojiPanel(true)}
        >
          <View style={styles.avatarContainer}>
            <Avatar
              uri={hostProfile.avatarUrl}
              name={hostProfile.displayName}
              size={42}
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
            style={[typography.overline, { color: colors.textSecondary, marginTop: 4, fontSize: 10 }]}
            numberOfLines={1}
          >
            {hostProfile.displayName.split(' ')[0]}
          </Text>
        </Pressable>

        {/* Connection indicator */}
        <View style={styles.connectionLine}>
          <View style={[styles.dot, { backgroundColor: guestProfile ? colors.success : colors.primary }]} />
          <Animated.View style={[styles.line, { width: lineWidth, backgroundColor: colors.textPrimary, opacity: lineOpacity }]} />
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
                size={42}
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
              style={[typography.overline, { color: colors.textSecondary, marginTop: 4, fontSize: 10 }]}
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
            <Text style={[typography.overline, { color: colors.textDisabled, marginTop: 4, fontSize: 10 }]}>
              Bekleniyor
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Leave button */}
      <Pressable
        style={[styles.leaveBtn, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}
        onPress={onLeave}
      >
        <Ionicons name="exit-outline" size={16} color={colors.error} />
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
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    width: 60,
  },
  avatarContainer: {
    position: 'relative',
  },
  roleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(15, 18, 28, 0.9)',
  },
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    height: 2,
    borderRadius: 1,
  },
  emptyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
  },
});
