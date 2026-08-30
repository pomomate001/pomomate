import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../core/pomodoro';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { TimerMode } from '../../../types';

interface TimerFaceProps {
  remainingSeconds: number;
  duration: number;
  mode: TimerMode;
  isRunning: boolean;
}

function modeColor(mode: TimerMode, colors: ReturnType<typeof useColors>) {
  if (mode === 'work') return colors.timerWork;
  if (mode === 'shortBreak') return colors.timerShortBreak;
  return colors.timerLongBreak;
}

const modeLabel: Record<TimerMode, string> = {
  work: 'ÇALIŞMA',
  shortBreak: 'KISA MOLA',
  longBreak: 'UZUN MOLA',
};

export function TimerFaceMinimal({ remainingSeconds, mode }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);

  return (
    <View style={styles.container}>
      <Text style={[typography.timer, { color, fontSize: 80, fontWeight: '200', letterSpacing: 4 }]}>
        {formatDuration(remainingSeconds)}
      </Text>
      <View style={[styles.labelBadge, { backgroundColor: `${color}20` }]}>
        <Ionicons name="time-outline" size={16} color={color} style={{ marginRight: spacing.xs }} />
        <Text style={[typography.captionBold, { color, letterSpacing: 2 }]}>
          {modeLabel[mode]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.md,
  },
});
