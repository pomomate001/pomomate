import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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

const SIZE = 220;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

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

export function TimerFaceCircle({ remainingSeconds, duration, mode }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);
  const progress = duration > 0 ? remainingSeconds / duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.surfaceVariant}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 2 }]}>
          {modeLabel[mode]}
        </Text>
        <Text style={[typography.timer, { color }]}>{formatDuration(remainingSeconds)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  center: { alignItems: 'center' },
});
