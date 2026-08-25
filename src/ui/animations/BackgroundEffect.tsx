/**
 * Background effect renderer.
 * Resolves the active background animation by id with zero JS-thread overhead.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { RainEffect } from './RainEffect';
import { SnowEffect } from './SnowEffect';
import { AuroraEffect } from './AuroraEffect';
import { BubblesEffect } from './BubblesEffect';

export interface BackgroundEffectProps {
  effectId: string;
  children?: React.ReactNode;
}

const STATIC_PARTICLES = [
  { left: '10%', top: '15%', size: 5, opacity: 0.25 },
  { left: '30%', top: '65%', size: 7, opacity: 0.2 },
  { left: '55%', top: '25%', size: 4, opacity: 0.3 },
  { left: '75%', top: '75%', size: 6, opacity: 0.15 },
  { left: '90%', top: '40%', size: 5, opacity: 0.25 },
  { left: '20%', top: '85%', size: 4, opacity: 0.2 },
  { left: '80%', top: '10%', size: 6, opacity: 0.2 },
];

/** Particles — lightweight memoized static ambient dots. */
const ParticlesEffect = React.memo(function ParticlesEffect() {
  const colors = useColors();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STATIC_PARTICLES.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: colors.primaryLight,
            opacity: p.opacity,
            left: p.left as any,
            top: p.top as any,
          }}
        />
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
      {effectId === 'aurora' && <AuroraEffect />}
      {effectId === 'bubbles' && <BubblesEffect />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
