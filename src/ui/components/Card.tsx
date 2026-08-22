import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, elevation = 'sm' }: CardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, shadows[elevation], { backgroundColor: colors.card }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
});
