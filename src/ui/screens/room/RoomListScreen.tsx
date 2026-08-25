import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
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
import { useRoomStore, useUserStore } from '../../../state';
import type { Room } from '../../../types';

interface RoomListScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onEnterRoom: (roomId: string) => void;
}

function RoomCard({
  room,
  isHost,
  onPress,
  onDelete,
}: {
  room: Room;
  isHost: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();

  const handleCopyCode = () => {
    const code = room.inviteCode ?? room.id.slice(-6).toUpperCase();
    Alert.alert('Oda Kodu', `Oda Kodu: ${code}\nArkadaşlarınla paylaşarak onları davet edebilirsin!`);
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roomCard,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: room.isActive ? colors.success : colors.border,
          borderWidth: room.isActive ? 1.5 : 1,
        },
      ]}
    >
      {/* Icon Status */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: room.isActive ? `${colors.success}20` : colors.surfaceVariant,
          },
        ]}
      >
        <Ionicons
          name={room.isActive ? 'radio' : 'pause-circle-outline'}
          size={22}
          color={room.isActive ? colors.success : colors.textDisabled}
        />
      </View>

      {/* Info */}
      <View style={styles.roomInfo}>
        <View style={styles.titleRow}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
            {room.name}
          </Text>
          {isHost && (
            <View style={[styles.hostBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[typography.overline, { color: colors.primary }]}>👑 SAHİBİ</Text>
            </View>
          )}
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: room.isActive ? colors.success : colors.textDisabled }]} />
          <Text
            style={[
              typography.captionBold,
              { color: room.isActive ? colors.success : colors.textDisabled, marginRight: spacing.md },
            ]}
          >
            {room.isActive ? 'Aktif (Canlı)' : 'Pasif (Kapalı)'}
          </Text>

          <Pressable onPress={handleCopyCode} style={styles.codeBadge}>
            <Ionicons name="copy-outline" size={12} color={colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Kod: {room.inviteCode ?? room.id.slice(-6).toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>

      {/* Delete / Enter Action */}
      <View style={styles.cardActions}>
        {isHost && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert('Odayı Sil', `"${room.name}" odasını silmek istediğinize emin misiniz?`, [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: onDelete },
              ]);
            }}
            hitSlop={10}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
      </View>
    </Pressable>
  );
}

export function RoomListScreen({ onCreateRoom, onJoinRoom, onEnterRoom }: RoomListScreenProps) {
  const colors = useColors();
  const rooms = useRoomStore((s) => s.rooms);
  const deleteRoom = useRoomStore((s) => s.deleteRoom);
  const user = useUserStore((s) => s.user);

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
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Çalışma Odaları</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Arkadaşlarınla birlikte odaklan, hedeflerini paylaş
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button
            title="Oda Oluştur"
            onPress={onCreateRoom}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
          />
        </View>
        <View style={{ width: spacing.md }} />
        <View style={{ flex: 1 }}>
          <Button
            title="Katıl"
            variant="outline"
            onPress={onJoinRoom}
            icon={<Ionicons name="enter-outline" size={20} color={colors.primary} />}
          />
        </View>
      </View>

      {/* Rooms List */}
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            isHost={item.hostId === (user?.id ?? 'host')}
            onPress={() => onEnterRoom(item.id)}
            onDelete={() => deleteRoom(item.id)}
          />
        )}
        contentContainerStyle={rooms.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="library-outline" size={56} color={colors.textDisabled} />}
            title="Henüz çalışma odası yok"
            message="Yeni bir oda oluşturarak canlı oturum başlat veya bir oda koduna katılarak arkadaşlarına katıl."
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomInfo: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  deleteBtn: {
    padding: 6,
  },
});
