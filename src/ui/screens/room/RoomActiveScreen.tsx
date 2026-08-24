import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Card } from '../../components/Card';
import { BackgroundEffect } from '../../animations/BackgroundEffect';
import { ParticipantsBar } from './ParticipantsBar';
import { RoomTimer, RoomTasks, RoomChat, RoomMedia, RoomFiles } from './features';
import { useRoomStore, useSettingsStore, useTaskStore, useUserStore } from '../../../state';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';

type RoomTab = 'tasks' | 'chat' | 'files';

interface RoomActiveScreenProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomActiveScreen({ roomId, onLeave }: RoomActiveScreenProps) {
  const [activeTab, setActiveTab] = useState<RoomTab>('tasks');
  const [showAddTask, setShowAddTask] = useState(false);
  const colors = useColors();

  const room = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const user = useUserStore((s) => s.user);

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);

  const roomTasks = tasks.filter((t) => t.roomId === roomId);
  const isHost = !room?.hostId || room.hostId === (user?.id ?? 'host');

  const participants = [
    {
      userId: user?.id ?? 'my-user',
      displayName: user?.displayName ?? 'Sen (Host)',
      avatarUrl: user?.avatarUrl ?? undefined,
    },
    ...members.map((m) => ({
      userId: m.userId,
      displayName: m.userId.slice(0, 6),
      avatarUrl: undefined,
    })),
  ];

  const handleAddTask = (title: string, tag: string | null, recurrence: any) => {
    addTask({
      id: generateId(),
      userId: user?.id ?? 'my-user',
      roomId,
      title,
      tag,
      recurrence: { type: recurrence },
      targetDate: new Date().toISOString().split('T')[0],
      completed: false,
      pomodoroCount: 0,
      createdAt: nowIso(),
    });
  };

  const handleShareCode = () => {
    Alert.alert(
      'Odaya Arkadaş Davet Et',
      `Oda Kodu: ${roomId}\n\nArkadaşların bu kodu "Odaya Katıl" ekranına yazarak doğrudan bu oturuma bağlanabilir.`,
      [{ text: 'Tamam' }],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BackgroundEffect effectId={backgroundEffectId} />

      <AddTaskSheet
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
      />

      {/* Header */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Pressable onPress={onLeave} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 17 }]} numberOfLines={1}>
              {room?.name ?? 'Çalışma Odası'}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.liveBadge, { backgroundColor: colors.error }]}>
                <View style={styles.liveDot} />
                <Text style={[typography.overline, { color: '#FFFFFF', fontSize: 9 }]}>CANLI</Text>
              </View>

              <Pressable onPress={handleShareCode} style={[styles.codePill, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="key-outline" size={11} color={colors.primary} style={{ marginRight: 3 }} />
                <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
                  {roomId.slice(-6).toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleShareCode} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Participants Avatars Bar */}
        <View style={styles.participantsWrap}>
          <ParticipantsBar participants={participants} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Session Card: Compact Timer & Media Controls */}
        <Card variant="glass" style={styles.mainSessionCard}>
          <RoomTimer isHost={isHost} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <RoomMedia />
        </Card>

        {/* Tab Selector: Tasks vs Chat vs Files */}
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          <Pressable
            onPress={() => setActiveTab('tasks')}
            style={[
              styles.tabBtn,
              activeTab === 'tasks' && { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name="list"
              size={16}
              color={activeTab === 'tasks' ? colors.textInverse : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'tasks' ? colors.textInverse : colors.textSecondary },
              ]}
            >
              Görevler ({roomTasks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('chat')}
            style={[
              styles.tabBtn,
              activeTab === 'chat' && { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={16}
              color={activeTab === 'chat' ? colors.textInverse : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'chat' ? colors.textInverse : colors.textSecondary },
              ]}
            >
              Sohbet
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('files')}
            style={[
              styles.tabBtn,
              activeTab === 'files' && { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name="folder-open"
              size={16}
              color={activeTab === 'files' ? colors.textInverse : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.captionBold,
                { color: activeTab === 'files' ? colors.textInverse : colors.textSecondary },
              ]}
            >
              Dosyalar
            </Text>
          </Pressable>
        </View>

        {/* Tab Content Card */}
        <Card variant="glass" style={styles.tabContentCard}>
          {activeTab === 'tasks' && (
            <View>
              <View style={styles.tasksHeader}>
                <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                  ORTAK ÇALIŞMA GÖREVLERİ
                </Text>
                <Pressable
                  onPress={() => setShowAddTask(true)}
                  style={[styles.addTaskMiniBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add" size={16} color={colors.textInverse} />
                  <Text style={[typography.captionBold, { color: colors.textInverse, marginLeft: 2 }]}>
                    Görev Ekle
                  </Text>
                </Pressable>
              </View>

              <RoomTasks tasks={roomTasks} onAddTask={() => setShowAddTask(true)} />
            </View>
          )}

          {activeTab === 'chat' && <RoomChat roomId={roomId} />}

          {activeTab === 'files' && <RoomFiles />}
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  titleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 3,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  participantsWrap: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  mainSessionCard: {
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
    opacity: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  tabContentCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    minHeight: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  addTaskMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
