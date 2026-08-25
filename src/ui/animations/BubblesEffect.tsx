import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme';

// Pre-computed fixed bubble positions
const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 14 + (i % 5) * 6,
  left: `${((i * 23) % 90) + 5}%`,
  top: `${((i * 31) % 85) + 7}%`,
  opacity: 0.15 + (i % 3) * 0.08,
}));

export const BubblesEffect = React.memo(function BubblesEffect() {
  const colors = useColors();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLES.map((b) => (
        <View
          key={b.id}
          style={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            borderWidth: 1.5,
            borderColor: colors.primaryLight,
            backgroundColor: 'transparent',
            opacity: b.opacity,
            left: b.left as any,
            top: b.top as any,
          }}
        />
      ))}
    </View>
  );
});
