import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { MediaStream } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';

interface SharedFile {
  id: string;
  uri: string;
  fileName: string;
  fileType: string;
  sharedBy: string;
}

interface RoomScreenPanelProps {
  sharedFile: SharedFile | null;
  isScreenSharing: boolean;
  screenStream?: MediaStream | null;
  isHost: boolean;
  allowFiles: boolean;
  onPickFile: () => void;
  onRemoveFile: () => void;
}

export const RoomScreenPanel: React.FC<RoomScreenPanelProps> = ({
  sharedFile,
  isScreenSharing,
  screenStream,
  isHost,
  allowFiles,
  onPickFile,
  onRemoveFile,
}) => {
  // Rotation logic
  const [rotationMultiplier, setRotationMultiplier] = useState(0);

  // Focal Zoom & Pan logic
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const containerWidth = useSharedValue(300);
  const containerHeight = useSharedValue(300);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.max(1, Math.min(savedScale.value * e.scale, 6));
      scale.value = newScale;

      // Focal point zoom calculation
      const centerX = containerWidth.value / 2;
      const centerY = containerHeight.value / 2;
      const scaleRatio = newScale / savedScale.value;

      translateX.value = savedTranslateX.value + (e.focalX - centerX) * (1 - scaleRatio);
      translateY.value = savedTranslateY.value + (e.focalY - centerY) * (1 - scaleRatio);
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1.2) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        const centerX = containerWidth.value / 2;
        const centerY = containerHeight.value / 2;
        const targetScale = 2.5;
        scale.value = withTiming(targetScale);
        const targetX = (centerX - e.x) * 1.5;
        const targetY = (centerY - e.y) * 1.5;
        translateX.value = withTiming(targetX);
        translateY.value = withTiming(targetY);
        savedScale.value = targetScale;
        savedTranslateX.value = targetX;
        savedTranslateY.value = targetY;
      }
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const resetTransform = () => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setRotationMultiplier(0);
  };

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: withTiming(`${rotationMultiplier * 90}deg`) },
        { scale: scale.value },
      ],
    };
  });

  if (isScreenSharing) {
    if (screenStream && screenStream.toURL) {
      return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
          <RTCView
            streamURL={screenStream.toURL()}
            style={styles.imageContent}
            objectFit="contain"
            mirror={false}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Ionicons name="desktop-outline" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.statusText}>Ekran paylaşılıyor...</Text>
      </View>
    );
  }

  if (sharedFile) {
    const isImage = sharedFile.fileType.startsWith('image');
    return (
      <View
        style={styles.container}
        onLayout={(e) => {
          containerWidth.value = e.nativeEvent.layout.width;
          containerHeight.value = e.nativeEvent.layout.height;
        }}
      >
        {isImage ? (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageContainer}>
              <Animated.Image 
                source={{ uri: sharedFile.uri }} 
                style={[styles.imageContent, animatedImageStyle]} 
                resizeMode="contain" 
              />
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={styles.fileContent}>
            <Ionicons name="document-text-outline" size={64} color="#FFF" />
            <Text style={styles.fileName}>{sharedFile.fileName}</Text>
          </View>
        )}
        
        {/* Top-Right Tools */}
        <View style={styles.toolsOverlay}>
          {isImage && (
            <>
              <Pressable 
                style={styles.iconButton} 
                onPress={resetTransform}
              >
                <Ionicons name="scan-outline" size={20} color="#FFF" />
              </Pressable>
              <Pressable 
                style={styles.iconButton} 
                onPress={() => setRotationMultiplier(r => r + 1)}
              >
                <Ionicons name="refresh" size={20} color="#FFF" />
              </Pressable>
            </>
          )}
          
          {(isHost || allowFiles) && (
            <Pressable style={styles.iconButton} onPress={onRemoveFile}>
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dropzone}
        onPress={(isHost || allowFiles) ? onPickFile : undefined}
        disabled={!(isHost || allowFiles)}
      >
        <Ionicons name="cloud-upload-outline" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.dropzoneText}>
          {(isHost || allowFiles) ? 'Ekranınızı paylaşın veya dosya yükleyin' : 'Henüz bir içerik paylaşılmadı'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  dropzone: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
  },
  dropzoneText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    width: '100%',
    height: '100%',
  },
  fileContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  toolsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
