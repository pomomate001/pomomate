import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      style={[styles.roomCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconBox, { backgroundColor: room.isActive ? `${colors.success}20` : colors.surfaceVariant }]}>
        <Ionicons name={room.isActive ? "radio" : "time-outline"} size={20} color={room.isActive ? colors.success : colors.textSecondary} />
      </View>
      <View style={styles.roomInfo}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{room.name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {room.isActive ? 'Aktif oturum' : 'Sona erdi'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
    </Pressable>
  );
}

export function RoomListScreen({ onCreateRoom, onJoinRoom, onEnterRoom }: RoomListScreenProps) {
  const colors = useColors();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Text style={[typography.h2, { color: colors.textInverse }]}>Çalışma Odaları</Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs }]}>
            Arkadaşlarınla birlikte odaklan
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Oda Oluştur"
          onPress={onCreateRoom}
          icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
          style={styles.actionBtn}
        />
        <View style={{ width: spacing.md }} />
        <Button
          title="Katıl"
          variant="outline"
          onPress={onJoinRoom}
          icon={<Ionicons name="enter-outline" size={20} color={colors.primary} />}
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
            icon={<Ionicons name="library-outline" size={56} color={colors.textDisabled} />}
            title="Açık çalışma odası yok"
            message="Yeni bir oda oluşturarak odaklanmaya başla veya var olan bir odaya katıl."
          />
        }
        ListFooterComponent={<AdPlacement size="banner" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  actionBtn: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomInfo: { flex: 1 },
});
