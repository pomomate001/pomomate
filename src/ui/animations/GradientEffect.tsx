import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../theme';

export function GradientEffect() {
  const colors = useColors();
  const [anim] = React.useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.8] }) }]} pointerEvents="none">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
