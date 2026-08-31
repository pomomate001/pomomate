/**
 * EmojiFloatingAnimation — Animated emoji that floats up from an avatar.
 *
 * When an emoji is received, it appears at the avatar position
 * and floats upward while fading out.
 */
import React, { useEffect, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import type { BuddyEmojiCode } from '../../../types';

interface EmojiFloatingAnimationProps {
  emojiCode: BuddyEmojiCode | null;
  /** Unique key to trigger a new animation */
  animationKey: string;
}

const EMOJI_MAP: Record<BuddyEmojiCode, string> = {
  wave: '👋',
  start: '▶️',
  hello: '😊',
  break: '☕',
  focus: '🎯',
  cheer: '🎉',
};

export function EmojiFloatingAnimation({ emojiCode, animationKey }: EmojiFloatingAnimationProps) {
  const [translateY] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    if (!emojiCode) return;

    // Reset
    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(0.5);

    // Animate: pop in, float up, fade out
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -120,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [animationKey, emojiCode, opacity, scale, translateY]);

  if (!emojiCode) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.emoji}>{EMOJI_MAP[emojiCode]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    zIndex: 200,
  },
  emoji: {
    fontSize: 36,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
  },
});
