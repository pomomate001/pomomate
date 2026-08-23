/**
 * Background effect renderer.
 * Resolves the active background animation by id.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { GradientEffect } from './GradientEffect';
import { RainEffect } from './RainEffect';
import { SnowEffect } from './SnowEffect';
import { AuroraEffect } from './AuroraEffect';
import { BubblesEffect } from './BubblesEffect';

export interface BackgroundEffectProps {
  effectId: string;
  children?: React.ReactNode;
}

/** Particles — simple animated dots rendered as plain Views. */
function ParticlesEffect() {
  const colors = useColors();
  // Lightweight static preview; real animation uses Reanimated in the future.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[0.1, 0.3, 0.55, 0.75, 0.9].map((pos, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primaryLight,
            opacity: 0.25,
            left: `${pos * 100}%` as unknown as number,
            top: `${((i * 37) % 80) + 10}%` as unknown as number,
          }}
        />
      ))}
    </View>
  );
}

export function BackgroundEffect({ effectId, children }: BackgroundEffectProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {effectId === 'particles' && <ParticlesEffect />}
      {effectId === 'gradient' && <GradientEffect />}
      {effectId === 'rain' && <RainEffect />}
      {effectId === 'snow' && <SnowEffect />}
      {effectId === 'aurora' && <AuroraEffect />}
      {effectId === 'bubbles' && <BubblesEffect />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
