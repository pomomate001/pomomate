import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  variant?: 'default' | 'glass' | 'gradientBorder';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r)) return hex; // Fallback
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Card({ children, style, elevation = 'sm', variant = 'default' }: CardProps) {
  const colors = useColors();

  const baseStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: variant === 'glass' ? hexToRgba(colors.card, 0.7) : colors.card,
    ...(variant === 'glass' && { borderWidth: 1, borderColor: hexToRgba(colors.border, 0.5) }),
    ...style,
  };

  if (variant === 'gradientBorder') {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[shadows[elevation], styles.gradientWrapper, style]}
      >
        <View style={[styles.card, { backgroundColor: colors.card, margin: 2 }]}>
          {children}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[baseStyle, shadows[elevation]]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  gradientWrapper: {
    borderRadius: radius.lg + 2,
  }
});
