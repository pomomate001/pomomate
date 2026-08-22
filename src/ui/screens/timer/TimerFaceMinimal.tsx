import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../../core/pomodoro';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
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
  work: 'Çalışma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

export function TimerFaceMinimal({ remainingSeconds, mode }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
        {modeLabel[mode]}
      </Text>
      <Text style={[typography.timer, { color }]}>{formatDuration(remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
