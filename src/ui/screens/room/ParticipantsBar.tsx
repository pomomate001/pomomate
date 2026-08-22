/**
 * Participants bar — shows room member avatars.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface ParticipantsBarProps {
  participants: Participant[];
  maxDisplay?: number;
}

export function ParticipantsBar({ participants, maxDisplay = 8 }: ParticipantsBarProps) {
  const colors = useColors();
  const visible = participants.slice(0, maxDisplay);
  const overflow = participants.length - maxDisplay;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bar}>
      {visible.map((p) => (
        <View key={p.userId} style={styles.item}>
          <Avatar uri={p.avatarUrl} name={p.displayName} size={32} />
          <Text
            style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
            numberOfLines={1}
          >
            {p.displayName.split(' ')[0]}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={styles.item}>
          <View style={[styles.overflowBadge, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>+{overflow}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  item: { alignItems: 'center', marginRight: spacing.md, width: 48 },
  overflowBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
