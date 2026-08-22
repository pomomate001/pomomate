/**
 * Room list — shows active/past rooms, create & join actions.
 */
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { AdPlacement } from '../../ads';
import type { Room } from '../../../types';

// Mock rooms until M03
const mockRooms: Room[] = [];

interface RoomListScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onEnterRoom: (roomId: string) => void;
}

function RoomCard({ room, onPress }: { room: Room; onPress: () => void }) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.roomCard, shadows.sm, { backgroundColor: colors.card }]}
    >
      <View style={styles.roomInfo}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{room.name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {room.isActive ? '🟢 Aktif' : '⚪ Sona erdi'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

export function RoomListScreen({ onCreateRoom, onJoinRoom, onEnterRoom }: RoomListScreenProps) {
  const colors = useColors();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Oda Oluştur"
          onPress={onCreateRoom}
          icon={<Ionicons name="add-circle-outline" size={18} color={colors.textInverse} />}
          style={styles.actionBtn}
        />
        <Button
          title="Odaya Katıl"
          variant="outline"
          onPress={onJoinRoom}
          icon={<Ionicons name="enter-outline" size={18} color={colors.primary} />}
          style={styles.actionBtn}
        />
      </View>

      <FlatList
        data={mockRooms}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={() => onEnterRoom(item.id)} />
        )}
        contentContainerStyle={mockRooms.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="people-outline" size={48} color={colors.textDisabled} />}
            title="Henüz çalışma odası yok"
            message="Oda oluşturun veya bir odaya katılın"
          />
        }
        ListFooterComponent={<AdPlacement size="banner" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionBtn: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1 },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  roomInfo: { flex: 1 },
});
