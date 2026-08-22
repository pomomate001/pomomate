/**
 * Room feature: Shared timer view.
 * Displays the host's timer state for all room members.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../../../core/pomodoro';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import type { TimerMode } from '../../../../types';

const modeLabel: Record<TimerMode, string> = {
  work: 'Çalışma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

interface RoomTimerProps {
  remainingSeconds: number;
  mode: TimerMode;
}

export function RoomTimer({ remainingSeconds, mode }: RoomTimerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{modeLabel[mode]}</Text>
      <Text style={[typography.timerSmall, { color: colors.primary }]}>
        {formatDuration(remainingSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.md },
});
