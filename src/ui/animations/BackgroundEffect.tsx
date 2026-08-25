/**
 * Background effect renderer.
 * Resolves the active background animation by id with GPU native-driven 60fps animations.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useColors } from '../theme';
import { RainEffect } from './RainEffect';
import { SnowEffect } from './SnowEffect';
import { BubblesEffect } from './BubblesEffect';

export interface BackgroundEffectProps {
  effectId: string;
  children?: React.ReactNode;
}

const STATIC_PARTICLES = [
  { left: '12%', top: '18%', size: 5, duration: 2800, delay: 0 },
  { left: '28%', top: '65%', size: 7, duration: 3400, delay: 600 },
  { left: '55%', top: '25%', size: 4, duration: 2500, delay: 1200 },
  { left: '75%', top: '72%', size: 6, duration: 3200, delay: 400 },
  { left: '88%', top: '42%', size: 5, duration: 2900, delay: 900 },
  { left: '18%', top: '85%', size: 4, duration: 3100, delay: 1500 },
  { left: '82%', top: '12%', size: 6, duration: 2700, delay: 300 },
];

function FloatingParticle({
  p,
  color,
}: {
  p: typeof STATIC_PARTICLES[0];
  color: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: p.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: p.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, p.delay, p.duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.45, 0.15],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: p.size,
        height: p.size,
        borderRadius: p.size / 2,
        backgroundColor: color,
        opacity,
        left: p.left as any,
        top: p.top as any,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

/** Particles — gently floating & breathing ambient glow dots. */
const ParticlesEffect = React.memo(function ParticlesEffect() {
  const colors = useColors();
  const particleColor = colors.primaryLight || colors.primary;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STATIC_PARTICLES.map((p, i) => (
        <FloatingParticle key={i} p={p} color={particleColor} />
      ))}
    </View>
  );
});

export function BackgroundEffect({ effectId, children }: BackgroundEffectProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {effectId === 'particles' && <ParticlesEffect />}
      {effectId === 'rain' && <RainEffect />}
      {effectId === 'snow' && <SnowEffect />}
      {effectId === 'bubbles' && <BubblesEffect />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
