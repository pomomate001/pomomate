import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../core/pomodoro';
import { useColors, useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useSettingsStore } from '../../../state';
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

export function TimerFaceBold({ remainingSeconds, mode }: TimerFaceProps) {
  const colors = useColors();
  const { theme } = useTheme();
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const isVisualWallpaperActive =
    backgroundEffectId.startsWith('video_') ||
    backgroundEffectId.startsWith('image_');
  const color = modeColor(mode, colors);
  const isDarkLook = isVisualWallpaperActive || theme.dark;

  const badgeBg = isVisualWallpaperActive
    ? 'rgba(15, 18, 28, 0.72)'
    : theme.dark
    ? 'rgba(255, 255, 255, 0.08)'
    : colors.surface;

  return (
    <View style={styles.container}>
      <Text style={[typography.timer, { 
        color, 
        fontSize: 88, 
        fontWeight: 'bold', 
        letterSpacing: 2, 
        textShadowColor: isDarkLook ? 'rgba(0,0,0,0.8)' : 'transparent', 
        textShadowOffset: { width: 0, height: 2 }, 
        textShadowRadius: isDarkLook ? 8 : 0 
      }]}>
        {formatDuration(remainingSeconds)}
      </Text>
      <View style={[styles.labelBadge, { backgroundColor: badgeBg, borderColor: `${color}40`, borderWidth: 1 }]}>
        <Ionicons name="leaf-outline" size={16} color={color} style={{ marginRight: spacing.xs }} />
        <Text style={[typography.captionBold, { color, letterSpacing: 2, fontWeight: 'bold' }]}>
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
