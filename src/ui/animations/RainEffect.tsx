import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme';

// Pre-computed fixed positions to avoid layout thrashing and Math.random during renders
const RAIN_DROPS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${((i * 17) % 95) + 2}%`,
  top: `${((i * 23) % 90) + 4}%`,
  height: 12 + (i % 4) * 3,
  opacity: 0.25 + (i % 3) * 0.1,
}));

export const RainEffect = React.memo(function RainEffect() {
  const colors = useColors();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {RAIN_DROPS.map((drop) => (
        <View
          key={drop.id}
          style={{
            position: 'absolute',
            width: 2,
            height: drop.height,
            backgroundColor: colors.info || '#64B5F6',
            opacity: drop.opacity,
            left: drop.left as any,
            top: drop.top as any,
            borderRadius: 1,
            transform: [{ rotate: '15deg' }],
          }}
        />
      ))}
    </View>
  );
});
