import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../theme';

export function RainEffect() {
  const colors = useColors();
  
  // A simple static preview for now. Can be animated with translationY later.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(20)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 15,
            backgroundColor: colors.info,
            opacity: 0.4,
            left: `${Math.random() * 100}%` as any,
            top: `${Math.random() * 100}%` as any,
            transform: [{ rotate: '15deg' }]
          }}
        />
      ))}
    </View>
  );
}
