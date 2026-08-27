/**
 * Room feature: Dynamic Island–style compact timer bar.
 *
 * Sits at the top of the room screen as a pill/capsule.
 * - Collapsed: shows time + active task name
 * - Tap: pause / resume
 * - Expand (chevron tap): reveals reset, skip, add-task buttons
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDuration } from '../../../../core/pomodoro';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useTimerStore, useTaskStore } from '../../../../state';
import { soundService } from '../../../../services/mobile/sound/SoundService';
import type { TimerMode } from '../../../../types';

const modeColor: Record<TimerMode, string> = {
  work: '#FF6B35',
  shortBreak: '#4CAF50',
  longBreak: '#2196F3',
};

const modeEmoji: Record<TimerMode, string> = {
  work: '🍅',
  shortBreak: '☕',
  longBreak: '🌴',
};

const COLLAPSED_BAR = 48;
const EXPANDED_BAR = 160;

interface RoomTimerBarProps {
  roomId?: string;
  isHost?: boolean;
  onOpenAddTask?: () => void;
}

export function RoomTimerBar({ roomId, isHost = true, onOpenAddTask }: RoomTimerBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const expanded = useSharedValue(0); // 0 = collapsed, 1 = expanded

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

  // Sync ambient sound
  React.useEffect(() => {
    soundService.syncAmbientWithTimer(isRunning, mode);
    return () => {
      soundService.stopAmbient();
    };
  }, [isRunning, mode]);

  const roomTasks = roomId ? allTasks.filter((t) => t.roomId === roomId) : allTasks;
  const activeTask = roomTasks.find((t) => !t.completed) ?? roomTasks[0];

  const accentColor = modeColor[mode];
  const emoji = modeEmoji[mode];

  /* ─── Handlers ─── */

  const handleBarTap = useCallback(() => {
    if (isHost) {
      if (isRunning) {
        pause();
      } else {
        start();
      }
    }
  }, [isHost, isRunning, pause, start]);

  const handleToggleExpand = useCallback(() => {
    expanded.value = withSpring(expanded.value > 0.5 ? 0 : 1, {
      damping: 16,
      stiffness: 140,
    });
  }, [expanded]);

  /* ─── Animated Styles ─── */

  const containerStyle = useAnimatedStyle(() => {
    const h = interpolate(
      expanded.value,
      [0, 1],
      [COLLAPSED_BAR, EXPANDED_BAR],
      Extrapolation.CLAMP,
    );
    return { height: h };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      expanded.value,
      [0.4, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      expanded.value,
      [0, 1],
      [-10, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      expanded.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <View style={[styles.wrapper, { top: insets.top + spacing.sm }]}>
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          {
            backgroundColor: 'rgba(18, 18, 20, 0.92)',
            borderColor: `${accentColor}50`,
          },
        ]}
      >
        {/* ─── Top Row: Timer Pill ─── */}
        <Pressable onPress={handleBarTap} style={styles.topRow}>
          {/* Timer digits */}
          <View style={[styles.timerPill, { backgroundColor: `${accentColor}25`, borderColor: `${accentColor}60` }]}>
            <Text style={{ fontSize: 11, marginRight: 2 }}>{emoji}</Text>
            <Text style={[styles.timerDigits, { color: accentColor }]}>
              {formatDuration(remainingSeconds)}
            </Text>
            {isRunning && (
              <View style={[styles.runningDot, { backgroundColor: accentColor }]} />
            )}
          </View>

          {/* Task name */}
          <Text
            style={[styles.taskLabel, { color: '#FFFFFF' }]}
            numberOfLines={1}
          >
            {activeTask?.title ?? 'Görev yok'}
          </Text>

          {/* Expand chevron */}
          <Pressable onPress={handleToggleExpand} hitSlop={12} style={styles.chevronBtn}>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.6)" />
            </Animated.View>
          </Pressable>
        </Pressable>

        {/* ─── Expanded Content ─── */}
        <Animated.View style={[styles.expandedArea, expandedContentStyle]}>
          {/* Cycle info */}
          <View style={styles.infoRow}>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)' }]}>
              Döngü {currentCycle}
            </Text>
            {activeTask?.tag && (
              <Text style={[typography.caption, { color: accentColor, marginLeft: spacing.sm }]}>
                #{activeTask.tag}
              </Text>
            )}
          </View>

          {/* Controls */}
          {isHost && (
            <View style={styles.controlsRow}>
              <Pressable
                style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={reset}
              >
                <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={styles.controlLabel}>Sıfırla</Text>
              </Pressable>

              <Pressable
                style={[styles.controlBtn, { backgroundColor: `${accentColor}30` }]}
                onPress={isRunning ? pause : start}
              >
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={20}
                  color={accentColor}
                />
                <Text style={[styles.controlLabel, { color: accentColor }]}>
                  {isRunning ? 'Durdur' : 'Başlat'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={next}
              >
                <Ionicons name="play-skip-forward" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={styles.controlLabel}>Sonraki</Text>
              </Pressable>

              {onOpenAddTask && (
                <Pressable
                  style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={onOpenAddTask}
                >
                  <Ionicons name="add" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.controlLabel}>Görev</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Active task checkbox */}
          {activeTask && (
            <Pressable
              onPress={() => toggleCompleted(activeTask.id)}
              style={styles.taskCheckRow}
            >
              <Ionicons
                name={activeTask.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={activeTask.completed ? '#4CAF50' : 'rgba(255,255,255,0.4)'}
              />
              <Text
                style={[
                  styles.taskCheckText,
                  {
                    color: activeTask.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                    textDecorationLine: activeTask.completed ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={1}
              >
                {activeTask.title}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  container: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: COLLAPSED_BAR,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  timerDigits: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  runningDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 5,
  },
  taskLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  chevronBtn: {
    padding: 4,
  },
  expandedArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  controlBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 2,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  taskCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  taskCheckText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
