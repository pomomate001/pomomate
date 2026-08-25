import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
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
const STROKE = 14;
const R = (SIZE - STROKE - 20) / 2;

// 240-degree open arc gauge (bottom open)
const ARC_ANGLE = 240;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC_LENGTH = (ARC_ANGLE / 360) * CIRCUMFERENCE;

function modeColor(mode: TimerMode, colors: ReturnType<typeof useColors>) {
  if (mode === 'work') return colors.timerWork;
  if (mode === 'shortBreak') return colors.timerShortBreak;
  return colors.timerLongBreak;
}

const modeLabel: Record<TimerMode, string> = {
  work: 'Odaklanma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

const modeIcon: Record<TimerMode, keyof typeof Ionicons.glyphMap> = {
  work: 'flame-outline',
  shortBreak: 'leaf-outline',
  longBreak: 'moon-outline',
};

export function TimerFaceArc({ remainingSeconds, duration, mode }: TimerFaceProps) {
  const colors = useColors();
  const color = modeColor(mode, colors);
  const progress = duration > 0 ? remainingSeconds / duration : 0;
  
  // Progress offset along the 240 degree arc
  const strokeDashoffset = CIRCUMFERENCE - (ARC_LENGTH * progress);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primaryLight || '#90CAF9'} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Background Track Arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.surfaceVariant}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          transform={`rotate(150 ${SIZE / 2} ${SIZE / 2})`}
        />

        {/* Active Progress Arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#arcGrad)"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(150 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <View style={styles.center}>
        <View style={[styles.iconPill, { backgroundColor: `${color}20` }]}>
          <Ionicons name={modeIcon[mode]} size={20} color={color} />
        </View>
        <Text style={[styles.timerDigits, { color: colors.textPrimary }]}>
          {formatDuration(remainingSeconds)}
        </Text>
        <Text style={[typography.subtitle, { color: color, fontWeight: '600', marginTop: 2 }]}>
          {modeLabel[mode]}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          %{Math.round(progress * 100)} Kalan
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  iconPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  timerDigits: {
    fontSize: 54,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
});
