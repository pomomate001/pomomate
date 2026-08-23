import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
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

const SIZE = 280;
const STROKE = 12;
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

const modeIcon: Record<TimerMode, keyof typeof Ionicons.glyphMap> = {
  work: 'barbell-outline',
  shortBreak: 'cafe-outline',
  longBreak: 'bed-outline',
};

export function TimerFaceCircle({ remainingSeconds, duration, mode }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);
  const progress = duration > 0 ? remainingSeconds / duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.gradientEnd} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
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
          stroke="url(#grad)"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Ionicons name={modeIcon[mode]} size={32} color={color} style={{ marginBottom: 8 }} />
        <Text style={[typography.timerSmall, { color, fontSize: 60, fontWeight: '200' }]}>{formatDuration(remainingSeconds)}</Text>
        <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: 4 }]}>
          {modeLabel[mode]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
