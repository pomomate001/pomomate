import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../theme';

export function SnowEffect() {
  const colors = useColors();
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(30)].map((_, i) => {
        const size = Math.random() * 6 + 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.white,
              opacity: Math.random() * 0.5 + 0.3,
              left: `${Math.random() * 100}%` as any,
              top: `${Math.random() * 100}%` as any,
            }}
          />
        );
      })}
    </View>
  );
}
