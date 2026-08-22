import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import type { FriendSummary } from '../../../state/friendsStore';

interface FriendRowProps {
  friend: FriendSummary;
  onPress: (userId: string) => void;
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

export function FriendRow({ friend, onPress }: FriendRowProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={() => onPress(friend.userId)}
      style={[styles.row, { borderBottomColor: colors.divider }]}
    >
      <Avatar uri={friend.avatarUrl} name={friend.displayName} size={36} />
      <View style={styles.info}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
          {friend.displayName}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {formatHours(friend.totalWorkSeconds)} · 🍅 {friend.totalPomodoros} · 🔥 {friend.streak}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  info: { flex: 1, marginLeft: spacing.md },
});
