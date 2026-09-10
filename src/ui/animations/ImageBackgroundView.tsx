import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ImageBackgroundViewProps {
  source: ImageSourcePropType;
  overlayOpacity?: number;
}

export function ImageBackgroundView({
  source,
  overlayOpacity = 0.35,
}: ImageBackgroundViewProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', overflow: 'hidden' }]} pointerEvents="none">
      <Image
        source={source}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
        }}
        resizeMode="cover"
      />

      {/* Atmospheric gradient overlay for readability of status bar, clock, and controls */}
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
