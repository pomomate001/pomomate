import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../../core/pomodoro';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import type { TimerMode } from '../../../types';

interface TimerFaceProps {
  remainingSeconds: number;
  duration: number;
  mode: TimerMode;
  isRunning: boolean;
}

const modeLabel: Record<TimerMode, string> = {
  work: 'ÇALIŞMA',
  shortBreak: 'KISA MOLA',
  longBreak: 'UZUN MOLA',
};

function modeColor(mode: TimerMode, colors: ReturnType<typeof useColors>) {
  if (mode === 'work') return colors.timerWork;
  if (mode === 'shortBreak') return colors.timerShortBreak;
  return colors.timerLongBreak;
}

export function TimerFaceDigital({ remainingSeconds, duration, mode, isRunning }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }, shadows.md]}>
      <View style={[styles.modeIndicator, { backgroundColor: color }]}>
        <Text style={[typography.captionBold, { color: colors.background, letterSpacing: 1 }]}>
          {modeLabel[mode]}
        </Text>
      </View>
      <View style={styles.timeWrapper}>
        <Text style={[styles.timeText, { color: colors.textPrimary }]}>
          {formatDuration(remainingSeconds)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 160,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modeIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  timeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
});
