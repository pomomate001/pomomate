import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ImageBackgroundViewProps {
  source: ImageSourcePropType;
  overlayOpacity?: number;
}

export function ImageBackgroundView({
  source,
  overlayOpacity = 0.35,
}: ImageBackgroundViewProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="stretch"
      />

      {/* 3. Atmospheric gradient overlay for readability of status bar, clock, and controls */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.55)',
          `rgba(0, 0, 0, ${Math.max(0.12, overlayOpacity * 0.4)})`,
          'rgba(0, 0, 0, 0.65)',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
