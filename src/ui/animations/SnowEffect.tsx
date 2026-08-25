import React from 'react';
import { View, StyleSheet } from 'react-native';

// Pre-computed fixed snowflakes
const SNOW_FLAKES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: 3 + (i % 4) * 1.5,
  left: `${((i * 19) % 94) + 3}%`,
  top: `${((i * 29) % 92) + 4}%`,
  opacity: 0.3 + (i % 3) * 0.15,
}));

export const SnowEffect = React.memo(function SnowEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SNOW_FLAKES.map((flake) => (
        <View
          key={flake.id}
          style={{
            position: 'absolute',
            width: flake.size,
            height: flake.size,
            borderRadius: flake.size / 2,
            backgroundColor: '#FFFFFF',
            opacity: flake.opacity,
            left: flake.left as any,
            top: flake.top as any,
          }}
        />
      ))}
    </View>
  );
});
