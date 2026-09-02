import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
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
import { useRoomStore, useUserStore, useSettingsStore } from '../../../state';
import { roomService, roomInviteService } from '../../../services/room';
import type { Room } from '../../../types';
import { useTranslation } from '../../../i18n';

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
  const { t } = useTranslation();

  const handleCopyCode = async () => {
    const code = room.inviteCode ?? room.id.slice(-6).toUpperCase();
    await Clipboard.setStringAsync(code);
    Alert.alert(t('common.success'), t('common.copied'));
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
              <Text style={[typography.overline, { color: colors.primary }]}>{t('rooms.hostBadge')}</Text>
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
            {room.isActive ? t('rooms.activeLive') : t('rooms.passiveClosed')}
          </Text>

          <Pressable onPress={handleCopyCode} style={styles.codeBadge}>
            <Ionicons name="copy-outline" size={12} color={colors.textSecondary} style={{ marginRight: 3 }} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('rooms.codePrefix')}: {room.inviteCode ?? room.id.slice(-6).toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>

      {/* Delete / Enter Action */}
      <View style={styles.cardActions}>
        {isHost && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(t('rooms.deleteRoomTitle'), t('rooms.deleteRoomConfirm', { name: room.name }), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: onDelete },
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
  const { t } = useTranslation();
  const rooms = useRoomStore((s) => s.rooms);
  const deleteRoom = useRoomStore((s) => s.deleteRoom);
  const user = useUserStore((s) => s.user);
  const isPremium = useSettingsStore((s) => s.isPremium);

  const [pendingInvites, setPendingInvites] = useState<
    {
      id: string;
      roomId: string;
      roomName: string;
      inviteCode: string;
      senderName: string;
    }[]
  >([]);

  const fetchInvites = useCallback(async () => {
    if (!user?.id) return;
    const invites = await roomInviteService.getPendingInvites(user.id);
    setPendingInvites(invites);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchInvites();
    }, [fetchInvites])
  );

  useEffect(() => {
    if (!user?.id) return;
    const unsub = roomInviteService.listenForInvites(user.id, () => {
      fetchInvites();
    });
    return () => unsub();
  }, [user?.id, fetchInvites]);

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
          <Text style={[typography.h2, { color: colors.textPrimary }]}>{t('rooms.title')}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {t('rooms.subtitle')}
          </Text>
        </View>
      </View>

      {/* Pending Room Invitations */}
      {pendingInvites.map((inv) => (
        <View
          key={inv.id}
          style={[
            styles.inviteCard,
            shadows.md,
            { backgroundColor: colors.surface, borderColor: colors.primary },
          ]}
        >
          <View style={styles.inviteHeader}>
            <View style={[styles.inviteIconCircle, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="mail-unread" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.captionBold, { color: colors.primary, letterSpacing: 0.8 }]}>
                ÇALIŞMA ODASI DAVETİ 🎯
              </Text>
              <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]}>
                {inv.senderName} seni &quot;{inv.roomName}&quot; odasına davet etti!
              </Text>
            </View>
          </View>
          <View style={styles.inviteActions}>
            <Pressable
              style={[styles.inviteRejectBtn, { borderColor: colors.border }]}
              onPress={async () => {
                await roomInviteService.respondToInvite(inv.id, 'rejected');
                setPendingInvites((prev) => prev.filter((i) => i.id !== inv.id));
              }}
            >
              <Text style={[typography.captionBold, { color: colors.textSecondary }]}>Reddet</Text>
            </Pressable>
            <Pressable
              style={[styles.inviteAcceptBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await roomInviteService.respondToInvite(inv.id, 'accepted');
                setPendingInvites((prev) => prev.filter((i) => i.id !== inv.id));
                const res = await roomService.joinRoom(inv.inviteCode, user?.id || 'guest');
                if (res.room) {
                  useRoomStore.getState().addRoom(res.room);
                  onEnterRoom(res.room.id);
                }
              }}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={[typography.captionBold, { color: '#FFF' }]}>Odaya Katıl</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={{ flex: 1, position: 'relative' }}>
          <Button
            title={t('rooms.createRoom')}
            onPress={onCreateRoom}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
          />
          {!isPremium && (
            <View style={[styles.proBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Ionicons name="star" size={10} color={colors.warning} />
              <Text style={[styles.proBadgeText, { color: colors.warning }]}>PRO</Text>
            </View>
          )}
        </View>
        <View style={{ width: spacing.md }} />
        <View style={{ flex: 1 }}>
          <Button
            title={t('rooms.joinRoom')}
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
            title={t('rooms.noRooms')}
            message={t('rooms.noRoomsSubtitle')}
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
  proBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    zIndex: 10,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  inviteCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inviteIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  inviteRejectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteAcceptBtn: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
