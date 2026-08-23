import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme';

export function BubblesEffect() {
  const colors = useColors();
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(15)].map((_, i) => {
        const size = Math.random() * 20 + 10;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: colors.primaryLight,
              backgroundColor: 'transparent',
              opacity: Math.random() * 0.4 + 0.1,
              left: `${Math.random() * 100}%` as any,
              top: `${Math.random() * 100}%` as any,
            }}
          />
        );
      })}
    </View>
  );
}
