/**
 * EmojiReactionPanel — small panel for sending emoji reactions during buddy sessions.
 *
 * Displays 6 predefined emoji buttons in a horizontal row.
 * Each emoji triggers a callback with its code.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import type { BuddyEmojiCode } from '../../../types';

interface EmojiReactionPanelProps {
  visible: boolean;
  onSelectEmoji: (code: BuddyEmojiCode) => void;
  onClose: () => void;
}

interface EmojiOption {
  code: BuddyEmojiCode;
  emoji: string;
  label: string;
}

const EMOJI_OPTIONS: EmojiOption[] = [
  { code: 'wave', emoji: '👋', label: 'El Salla' },
  { code: 'start', emoji: '▶️', label: 'Başla' },
  { code: 'hello', emoji: '😊', label: 'Merhaba' },
  { code: 'break', emoji: '☕', label: 'Mola' },
  { code: 'focus', emoji: '🎯', label: 'Odaklan' },
  { code: 'cheer', emoji: '🎉', label: 'Tebrikler' },
];

export function EmojiReactionPanel({ visible, onSelectEmoji, onClose }: EmojiReactionPanelProps) {
  const colors = useColors();

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={[styles.container, { backgroundColor: 'rgba(15, 18, 28, 0.92)', borderColor: 'rgba(255, 255, 255, 0.15)' }]}>
        {EMOJI_OPTIONS.map((option) => (
          <Pressable
            key={option.code}
            style={[styles.emojiBtn, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => {
              onSelectEmoji(option.code);
              onClose();
            }}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[typography.overline, { color: colors.textSecondary, fontSize: 8, marginTop: 2 }]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  emojiBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    minWidth: 44,
  },
  emoji: {
    fontSize: 24,
  },
});
