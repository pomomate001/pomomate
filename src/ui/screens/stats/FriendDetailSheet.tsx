import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import { BottomSheet } from '../../components/BottomSheet';
import { StatCard } from './StatCard';
import { Ionicons } from '@expo/vector-icons';
import type { FriendSummary } from '../../../state/friendsStore';

interface FriendDetailSheetProps {
  friend: FriendSummary | null;
  visible: boolean;
  onClose: () => void;
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

export function FriendDetailSheet({ friend, visible, onClose }: FriendDetailSheetProps) {
  const colors = useColors();

  if (!friend) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Avatar uri={friend.avatarUrl} name={friend.displayName} size={56} />
        <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.sm }]}>
          {friend.displayName}
        </Text>
      </View>
      <View style={styles.cards}>
        <StatCard
          icon={<Ionicons name="time-outline" size={20} color={colors.info} />}
          label="Toplam Süre"
          value={formatHours(friend.totalWorkSeconds)}
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          icon={<Text style={{ fontSize: 18 }}>🍅</Text>}
          label="Pomodoro"
          value={String(friend.totalPomodoros)}
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          icon={<Text style={{ fontSize: 18 }}>🔥</Text>}
          label="Streak"
          value={String(friend.streak)}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg },
  cards: { flexDirection: 'row', marginTop: spacing.md },
});
