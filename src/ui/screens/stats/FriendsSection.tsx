import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useFriendsStore } from '../../../state';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
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
        style={[styles.header, { borderColor: colors.divider, backgroundColor: colors.surface }]}
      >
        <View style={styles.headerLeft}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Arkadaşlarım</Text>
          {!expanded && friends.length > 0 && (
            <View style={styles.avatarStack}>
              {friends.slice(0, 3).map((f, i) => (
                <View key={f.userId} style={[styles.stackItem, { zIndex: 3 - i, borderColor: colors.surface }]}>
                  <Avatar uri={f.avatarUrl} size={28} />
                </View>
              ))}
              {friends.length > 3 && (
                <View style={[styles.moreBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.surface }]}>
                  <Text style={[typography.overline, { color: colors.textSecondary }]}>+{friends.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded && (
        <View style={{ backgroundColor: colors.surface, paddingBottom: spacing.md }}>
          {friends.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={colors.textDisabled} />}
              title="Henüz arkadaş yok"
              action={
                <Button title="Arkadaş Ekle" variant="outline" size="sm" onPress={() => { alert('Arkadaş ekleme akışı yakında (M06)'); }} />
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
  container: { marginTop: spacing.xl, marginHorizontal: spacing.lg, borderRadius: 24, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  stackItem: {
    marginLeft: -8,
    borderWidth: 2,
    borderRadius: 16,
  },
  moreBadge: {
    marginLeft: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  }
});
