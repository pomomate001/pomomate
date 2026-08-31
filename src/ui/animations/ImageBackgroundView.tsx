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
      {/* 1. Ambient blurred base layer to seamlessly fill any screen aspect ratio */}
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={Platform.OS === 'android' ? 16 : 24}
      />

      {/* 2. Crisp main artwork layer */}
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* 3. Universal atmospheric gradient overlay for readability of status bar, clock, and controls */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.60)',
          `rgba(0, 0, 0, ${Math.max(0.15, overlayOpacity * 0.5)})`,
          'rgba(0, 0, 0, 0.65)',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
