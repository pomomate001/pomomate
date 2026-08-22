import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

export function Badge({ label, color, textColor }: BadgeProps) {
  const colors = useColors();

  return (
    <View style={[styles.badge, { backgroundColor: color ?? colors.primary }]}>
      <Text style={[typography.caption, { color: textColor ?? colors.textInverse }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
