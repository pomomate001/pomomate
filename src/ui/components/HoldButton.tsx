import React, { useRef, useState } from 'react';
import { View, Pressable, Animated, StyleSheet, Text } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface HoldButtonProps {
  onComplete: () => void;
  icon: React.ReactNode;
  label: string;
  holdDurationMs?: number;
  style?: any;
  variant?: 'primary' | 'danger' | 'ghost';
}

export function HoldButton({ onComplete, icon, label, holdDurationMs = 2000, style, variant = 'primary' }: HoldButtonProps) {
  const colors = useColors();
  const [isHolding, setIsHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const bgColors = {
    primary: colors.primary,
    danger: colors.error,
    ghost: 'rgba(15, 18, 28, 0.72)',
  };

  const handlePressIn = () => {
    setIsHolding(true);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: holdDurationMs,
      useNativeDriver: false, // width/height interpolation requires false
    }).start(({ finished }) => {
      if (finished) {
        onComplete();
        // Reset immediately after completion
        progressAnim.setValue(0);
        setIsHolding(false);
      }
    });
  };

  const handlePressOut = () => {
    setIsHolding(false);
    progressAnim.stopAnimation();
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: bgColors[variant],
          borderColor: variant === 'ghost' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.bgProgress, { width: widthInterpolation }]} />
      <Animated.View style={[styles.lineProgress, { width: widthInterpolation }]} />
      <View style={styles.content}>
        {icon}
        <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: spacing.xs, fontSize: 13 }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: spacing.md,
  },
  bgProgress: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  lineProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});