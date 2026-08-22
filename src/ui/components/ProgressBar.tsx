import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { radius } from '../theme/radius';

interface ProgressBarProps {
  progress: number; // 0..1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, color, height = 6, style }: ProgressBarProps) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: colors.surfaceVariant }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color ?? colors.primary, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.full, overflow: 'hidden' },
  fill: { borderRadius: radius.full },
});
