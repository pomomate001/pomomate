import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoBackgroundProps {
  source: any;
  overlayOpacity?: number;
}

export function VideoBackground({ source, overlayOpacity = 0.35 }: VideoBackgroundProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (player) {
      player.play();
    }
  }, [player]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
        surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
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
