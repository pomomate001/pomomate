import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore, useSettingsStore, useStatsStore } from '../../../state';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { TimerFace } from './TimerFace';
import { BackgroundEffect } from '../../animations';
import { AdPlacement } from '../../ads';
import { notificationService } from '../../../services/mobile';
import type { TimerMode } from '../../../types';

const modeLabels: Record<TimerMode, string> = {
  work: 'Çalışma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

export function TimerScreen() {
  const {
    remainingSeconds,
    duration,
    isRunning,
    mode,
    currentCycle,
    start,
    pause,
    reset,
    tick,
    next,
    setMode,
  } = useTimerStore();

  const timerDesignId = useSettingsStore((s) => s.timerDesignId);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const recordPomodoro = useStatsStore((s) => s.recordPomodoro);
  const workDuration = useSettingsStore((s) => s.workDuration);
  const colors = useColors();

  // Tick interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  // When timer hits 0, auto-advance and notify
  useEffect(() => {
    if (remainingSeconds === 0 && !isRunning) {
      if (mode === 'work') {
        recordPomodoro(workDuration);
        notificationService.scheduleTimerComplete(
          'Pomodoro Tamamlandı! 🍅',
          'Mola zamanı. İyi dinlenmeler!',
        );
      } else {
        notificationService.scheduleTimerComplete(
          'Mola Bitti! ⏰',
          'Çalışmaya geri dön.',
        );
      }
    }
  }, [remainingSeconds, isRunning, mode, recordPomodoro, workDuration]);

  const modeButtons: TimerMode[] = ['work', 'shortBreak', 'longBreak'];

  return (
    <BackgroundEffect effectId={backgroundEffectId}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mode selector */}
        <View style={styles.modeRow}>
          {modeButtons.map((m) => (
            <Button
              key={m}
              title={modeLabels[m]}
              variant={mode === m ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setMode(m)}
              style={styles.modeBtn}
            />
          ))}
        </View>

        {/* Timer face */}
        <View style={styles.timerWrap}>
          <TimerFace
            designId={timerDesignId}
            remainingSeconds={remainingSeconds}
            duration={duration}
            mode={mode}
            isRunning={isRunning}
          />
        </View>

        {/* Cycle indicator */}
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
          Döngü {currentCycle}
        </Text>

        {/* Controls */}
        <View style={styles.controls}>
          <IconButton
            icon={<Ionicons name="refresh" size={22} color={colors.textSecondary} />}
            onPress={reset}
          />
          <IconButton
            icon={
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={32}
                color={colors.primary}
              />
            }
            onPress={isRunning ? pause : start}
            size={64}
            style={{ backgroundColor: colors.surfaceVariant }}
          />
          <IconButton
            icon={<Ionicons name="play-skip-forward" size={22} color={colors.textSecondary} />}
            onPress={next}
          />
        </View>

        {/* Ad banner — below controls, never over timer */}
        <AdPlacement size="banner" />
      </ScrollView>
    </BackgroundEffect>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  modeBtn: { minWidth: 80 },
  timerWrap: {
    marginVertical: spacing.xxl,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
