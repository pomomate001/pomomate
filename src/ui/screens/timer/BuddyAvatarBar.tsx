import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import { EmojiReactionPanel } from './EmojiReactionPanel';
import { EmojiFloatingAnimation } from './EmojiFloatingAnimation';
import { useBuddyStore, useUserStore } from '../../../state';
import { useTranslation } from '../../../i18n';
import type { BuddyEmojiCode } from '../../../types';

interface BuddyAvatarBarProps {
  hostProfile: {
    id?: string;
    displayName: string;
    avatarUrl?: string;
  };
  guestProfile: {
    id?: string;
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
  const { t } = useTranslation();
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const recentEmojis = useBuddyStore((s) => s.recentEmojis);

  // Animations
  const animValue = useRef(new Animated.Value(guestProfile ? 1 : 0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const prevGuest = useRef(guestProfile?.id);

  useEffect(() => {
    const isJoining = guestProfile && !prevGuest.current;

    if (isJoining) {
      animValue.setValue(0);
      rippleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(animValue, {
        toValue: guestProfile ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
      if (!guestProfile) rippleAnim.setValue(0);
    }
    prevGuest.current = guestProfile?.id;
  }, [guestProfile, animValue, rippleAnim]);

  // Interpolations
  const gapSize = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0], // starts far, moves very close
  });

  const lineWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0], // line shrinks completely
  });

  const lineOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0, 0], // line fades out completely when connected
  });

  const hostTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10], // close the internal padding
  });

  const hostTranslateY = animValue.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [0, -18, -28, -18, 0], // curve up
  });

  const guestTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const guestTranslateY = animValue.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [0, 18, 28, 18, 0], // curve down
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 0],
  });

  const user = useUserStore((s) => s.user);

  // Get the latest emoji for animation
  const latestEmoji = recentEmojis.length > 0 ? recentEmojis[recentEmojis.length - 1] : null;

  // Check which avatar the latest emoji belongs to
  const isHostEmoji = latestEmoji
    ? hostProfile.id
      ? latestEmoji.senderId === hostProfile.id
      : myRole === 'host'
      ? latestEmoji.senderId === user?.id
      : latestEmoji.senderId !== user?.id
    : false;

  const isGuestEmoji = latestEmoji && guestProfile
    ? guestProfile.id
      ? latestEmoji.senderId === guestProfile.id
      : myRole === 'guest'
      ? latestEmoji.senderId === user?.id
      : latestEmoji.senderId !== user?.id
    : false;

  const handleSelectEmoji = useCallback(
    (code: BuddyEmojiCode) => {
      onSendEmoji(code);
    },
    [onSendEmoji],
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, { columnGap: gapSize }]}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: colors.primary,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
          pointerEvents="none"
        />

        {/* Host Avatar */}
        <Animated.View style={{ zIndex: 2, transform: [{ translateX: hostTranslateX }, { translateY: hostTranslateY }] }}>
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
              {latestEmoji && isHostEmoji && (
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
        </Animated.View>

        {/* Connection indicator */}
        <Animated.View style={[styles.connectionLine, { opacity: lineOpacity }]}>
          <View style={[styles.dot, { backgroundColor: guestProfile ? colors.success : colors.primary }]} />
          <Animated.View style={[styles.line, { width: lineWidth, backgroundColor: colors.textPrimary }]} />
          <View style={[styles.dot, { backgroundColor: guestProfile ? colors.success : colors.textDisabled }]} />
        </Animated.View>

        {/* Guest Avatar */}
        <Animated.View style={{ zIndex: 1, transform: [{ translateX: guestTranslateX }, { translateY: guestTranslateY }] }}>
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
                {latestEmoji && isGuestEmoji && (
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
                {t('buddy.waiting')}
              </Text>
            </View>
          )}
        </Animated.View>
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
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 0,
    alignSelf: 'center',
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
