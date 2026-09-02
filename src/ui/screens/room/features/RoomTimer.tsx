/**
 * Room feature: Shared timer view & controls with integrated task bar.
 * Hosts have full control over the session timer and task management.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../../core/pomodoro';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { IconButton } from '../../../components/IconButton';
import { useTimerStore, useTaskStore } from '../../../../state';
import { soundService } from '../../../../services/mobile/sound/SoundService';
import type { TimerMode } from '../../../../types';

const modeLabel: Record<TimerMode, { label: string; icon: string; emoji: string }> = {
  work: { label: 'Odaklanma', icon: 'flame', emoji: '🎯' },
  shortBreak: { label: 'Kısa Mola', icon: 'cafe', emoji: '☕' },
  longBreak: { label: 'Uzun Mola', icon: 'sunny', emoji: '🌴' },
};

interface RoomTimerProps {
  roomId?: string;
  isHost?: boolean;
  onOpenAddTask?: () => void;
}

export function RoomTimer({ roomId, isHost = true, onOpenAddTask }: RoomTimerProps) {
  const colors = useColors();
  const {
    remainingSeconds,
    isRunning,
    mode,
    currentCycle,
    start,
    pause,
    reset,
    next,
  } = useTimerStore();

  const allTasks = useTaskStore((s) => s.tasks);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);

  // Sync ambient sound during room session
  React.useEffect(() => {
    soundService.syncAmbientWithTimer(isRunning, mode);
    return () => {
      soundService.stopAmbient();
    };
  }, [isRunning, mode]);

  // Filter tasks belonging to this room, or general active tasks
  const roomTasks = roomId ? allTasks.filter((t) => t.roomId === roomId) : allTasks;
  const activeTask = roomTasks.find((t) => !t.completed) ?? roomTasks[0];

  const modeInfo = modeLabel[mode];

  return (
    <View style={styles.container}>
      {/* Mode Badge & Cycle */}
      <View style={styles.topInfoRow}>
        <View style={[styles.modeBadge, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={{ fontSize: 13, marginRight: 4 }}>{modeInfo.emoji}</Text>
          <Text style={[typography.captionBold, { color: colors.primary }]}>{modeInfo.label.toUpperCase()}</Text>
        </View>
        <View style={[styles.cycleBadge, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Döngü {currentCycle}</Text>
        </View>
      </View>

      {/* Main Timer Digits */}
      <Text style={[typography.timerSmall, styles.timerText, { color: colors.textPrimary }]}>
        {formatDuration(remainingSeconds)}
      </Text>

      {/* Host Controls */}
      {isHost ? (
        <View style={styles.controlsRow}>
          <IconButton
            icon={<Ionicons name="refresh" size={20} color={colors.textSecondary} />}
            onPress={reset}
            size={40}
            style={{ backgroundColor: colors.surfaceVariant }}
          />

          <IconButton
            icon={
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={26}
                color={colors.textInverse}
              />
            }
            onPress={isRunning ? pause : start}
            size={56}
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 6,
            }}
          />

          <IconButton
            icon={<Ionicons name="play-skip-forward" size={20} color={colors.textSecondary} />}
            onPress={next}
            size={40}
            style={{ backgroundColor: colors.surfaceVariant }}
          />
        </View>
      ) : (
        <View style={styles.syncRow}>
          <Ionicons name="sync" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Oda Sahibi (Host) ile senkronize
          </Text>
        </View>
      )}

      {/* ─── Integrated Room Tasks Bar ─── */}
      <View style={[styles.taskCard, { backgroundColor: `${colors.background}80`, borderColor: colors.border }]}>
        {activeTask ? (
          <View style={styles.taskContentRow}>
            <Pressable
              onPress={() => toggleCompleted(activeTask.id)}
              hitSlop={8}
              style={styles.checkboxBtn}
            >
              <Ionicons
                name={activeTask.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={activeTask.completed ? colors.success : colors.textSecondary}
              />
            </Pressable>

            <View style={{ flex: 1, paddingHorizontal: 6 }}>
              <Text
                style={[
                  typography.bodyBold,
                  {
                    color: activeTask.completed ? colors.textDisabled : colors.textPrimary,
                    textDecorationLine: activeTask.completed ? 'line-through' : 'none',
                    fontSize: 14,
                  },
                ]}
                numberOfLines={1}
              >
                {activeTask.title}
              </Text>
              {activeTask.tag && (
                <Text style={[typography.caption, { color: colors.primary, fontSize: 11 }]}>
                  #{activeTask.tag}
                </Text>
              )}
            </View>

            {isHost && onOpenAddTask && (
              <Pressable
                onPress={onOpenAddTask}
                hitSlop={8}
                style={[styles.addSmallBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.emptyTaskRow}>
            <Ionicons name="checkbox-outline" size={18} color={colors.textDisabled} />
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, marginLeft: 6 }]}>
              {isHost ? 'Odaya bir görev ekle ve birlikte tamamlayın' : 'Henüz oda görevi atanmadı'}
            </Text>
            {isHost && onOpenAddTask && (
              <Pressable
                onPress={onOpenAddTask}
                style={[styles.addBadgeBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.captionBold, { color: colors.textInverse, fontSize: 11 }]}>
                  + Görev Ekle
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  cycleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  timerText: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    marginVertical: spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  taskCard: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  taskContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBtn: {
    padding: 2,
  },
  emptyTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSmallBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadgeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
