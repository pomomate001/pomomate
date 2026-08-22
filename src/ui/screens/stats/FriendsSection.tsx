/**
 * Collapsible friends section inside the Stats screen.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useFriendsStore } from '../../../state';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { FriendRow } from './FriendRow';
import { FriendDetailSheet } from './FriendDetailSheet';
import type { FriendSummary } from '../../../state/friendsStore';

export function FriendsSection() {
  const [expanded, setExpanded] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendSummary | null>(null);
  const friends = useFriendsStore((s) => s.friends);
  const colors = useColors();

  return (
    <View style={styles.container}>
      {/* Toggle header */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[styles.header, { borderColor: colors.divider }]}
      >
        <Text style={[typography.subtitle, { color: colors.textPrimary }]}>Arkadaşlar</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded && (
        <View>
          {friends.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={36} color={colors.textDisabled} />}
              title="Henüz arkadaş yok"
              action={
                <Button title="Arkadaş Ekle" variant="outline" size="sm" onPress={() => {}} />
              }
            />
          ) : (
            friends.map((f) => (
              <FriendRow
                key={f.userId}
                friend={f}
                onPress={(uid) => {
                  const found = friends.find((fr) => fr.userId === uid) ?? null;
                  setSelectedFriend(found);
                }}
              />
            ))
          )}
        </View>
      )}

      <FriendDetailSheet
        friend={selectedFriend}
        visible={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
