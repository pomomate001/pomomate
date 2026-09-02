import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, Platform } from 'react-native';
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
      {/* 1. Ambient blurred base layer to seamlessly fill any screen aspect ratio (20:9, 19.5:9, etc.) without black bars */}
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={Platform.OS === 'android' ? 14 : 20}
      />

      {/* 2. Crisp main artwork layer - contain ensures 100% of the 9:16 visual is fully visible without side-cropping */}
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
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
