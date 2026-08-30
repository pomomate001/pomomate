import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';

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
        resizeMode="cover"
      />
      {overlayOpacity > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` },
          ]}
        />
      )}
    </View>
  );
}
