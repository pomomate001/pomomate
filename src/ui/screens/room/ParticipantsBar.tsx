/**
 * Participants bar — compact horizontal avatar list with stacked style.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.bar}>
      {/* Stacked avatars */}
      <View style={styles.stackedRow}>
        {visible.map((p, index) => (
          <View
            key={p.userId}
            style={[
              styles.stackedItem,
              { marginLeft: index === 0 ? 0 : -8, zIndex: visible.length - index },
            ]}
          >
            <Avatar uri={p.avatarUrl} name={p.displayName} size={26} />
          </View>
        ))}
        {overflow > 0 && (
          <View style={[styles.overflowBadge, { backgroundColor: colors.surfaceVariant, marginLeft: -8 }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, fontSize: 9 }]}>
              +{overflow}
            </Text>
          </View>
        )}
      </View>

      {/* Participant count */}
      <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
        {participants.length} kişi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stackedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedItem: {
    borderWidth: 2,
    borderColor: 'rgba(24, 24, 28, 0.95)',
    borderRadius: 13,
  },
  overflowBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(24, 24, 28, 0.95)',
  },
});
