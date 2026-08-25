import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
const STROKE = 8;
const R = (SIZE - 40) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const NEON_COLORS: Record<TimerMode, { primary: string; glow: string; secondary: string }> = {
  work: { primary: '#00F0FF', glow: '#00F0FF', secondary: '#7000FF' }, // Cyber cyan & neon violet
  shortBreak: { primary: '#00FF9D', glow: '#00FF9D', secondary: '#00B4D8' }, // Neon emerald & mint
  longBreak: { primary: '#FF007F', glow: '#FF007F', secondary: '#9D00FF' }, // Neon magenta & deep purple
};

const modeLabel: Record<TimerMode, string> = {
  work: 'CYBER WORK',
  shortBreak: 'NEON BREAK',
  longBreak: 'DEEP RELAX',
};

export function TimerFaceNeon({ remainingSeconds, duration, mode, isRunning }: TimerFaceProps) {
  const colors = useColors();
  const neon = NEON_COLORS[mode];
  const progress = duration > 0 ? remainingSeconds / duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  // Gentle neon pulse animation
  const pulseAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.85,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(0.9);
    }
  }, [isRunning, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Neon Glow Layer */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: neon.primary,
            shadowColor: neon.glow,
            opacity: pulseAnim,
          },
        ]}
      />

      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={neon.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={neon.secondary} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Outer subtle guide */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Inner dashed tech ring */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R - 16}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          strokeDasharray="4 6"
          fill="none"
        />

        {/* Active Neon Progress Stroke */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#neonGrad)"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      {/* Central Neon Digits */}
      <View style={styles.center}>
        <View style={[styles.badge, { borderColor: neon.primary, backgroundColor: `${neon.primary}15` }]}>
          <View style={[styles.dot, { backgroundColor: neon.primary }]} />
          <Text style={[styles.badgeText, { color: neon.primary }]}>
            {modeLabel[mode]}
          </Text>
        </View>

        <Text
          style={[
            styles.neonDigits,
            {
              color: '#FFFFFF',
              textShadowColor: neon.glow,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 16,
            },
          ]}
        >
          {formatDuration(remainingSeconds)}
        </Text>

        <Text style={[styles.subText, { color: 'rgba(255, 255, 255, 0.5)' }]}>
          {isRunning ? '● SİSTEM AKTİF' : '○ DURAKLATILDI'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute',
    width: SIZE - 20,
    height: SIZE - 20,
    borderRadius: (SIZE - 20) / 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  neonDigits: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  subText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 6,
  },
});
