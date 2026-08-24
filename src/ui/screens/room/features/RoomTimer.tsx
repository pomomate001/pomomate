/**
 * Room feature: Shared timer view & controls.
 * Hosts have full control over the session timer, while members see sync status.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../../core/pomodoro';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { IconButton } from '../../../components/IconButton';
import { useTimerStore } from '../../../../state';
import type { TimerMode } from '../../../../types';

const modeLabel: Record<TimerMode, { label: string; icon: string; emoji: string }> = {
  work: { label: 'Odaklanma', icon: 'flame', emoji: '🍅' },
  shortBreak: { label: 'Kısa Mola', icon: 'cafe', emoji: '☕' },
  longBreak: { label: 'Uzun Mola', icon: 'sunny', emoji: '🌴' },
};

interface RoomTimerProps {
  isHost?: boolean;
}

export function RoomTimer({ isHost = true }: RoomTimerProps) {
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
    setMode,
  } = useTimerStore();

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
    marginTop: spacing.sm,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
