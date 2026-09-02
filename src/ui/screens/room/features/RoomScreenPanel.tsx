import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { RTCView, type MediaStream } from 'react-native-webrtc';

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
  onEnterPiP?: () => void;
  onStopScreenShare?: () => void;
}

export const RoomScreenPanel: React.FC<RoomScreenPanelProps> = ({
  sharedFile,
  isScreenSharing,
  screenStream,
  isHost,
  allowFiles,
  onPickFile,
  onRemoveFile,
  onEnterPiP,
  onStopScreenShare,
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
    const streamUrl = screenStream ? screenStream.toURL() : null;

    return (
      <View style={styles.broadcastContainer}>
        {streamUrl ? (
          <RTCView
            streamURL={streamUrl}
            style={StyleSheet.absoluteFill}
            objectFit="contain"
            mirror={false}
          />
        ) : (
          <View style={styles.broadcastIconBox}>
            <Ionicons name="desktop" size={54} color="#A855F7" />
          </View>
        )}

        <View style={[styles.broadcastOverlay, streamUrl ? styles.broadcastOverlayActive : null]}>
          {/* Top Live Pill */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CANLI EKRAN YAYINI</Text>
          </View>

          {!streamUrl && (
            <View style={{ alignItems: 'center' }}>
              <View style={styles.broadcastIconBox}>
                <Ionicons name="desktop" size={54} color="#A855F7" />
              </View>
              <Text style={styles.broadcastTitle}>Ekranınız Odaya Paylaşılıyor</Text>
              <Text style={styles.broadcastDesc}>
                Katılımcılar şu anda ekranınızı canlı olarak izliyor.
              </Text>
            </View>
          )}

          {/* Action Controls - Positioned at bottom */}
          <View style={styles.broadcastActionsBottom}>
            {onStopScreenShare && (
              <Pressable style={styles.stopActionBtn} onPress={onStopScreenShare}>
                <Ionicons name="stop-circle-outline" size={18} color="#FF4D4D" />
                <Text style={styles.stopActionBtnText}>Ekran Paylaşımını Durdur</Text>
              </Pressable>
            )}
          </View>
        </View>
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
  broadcastContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(18, 18, 28, 0.95)',
  },
  broadcastOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 28, 0.7)',
    padding: 24,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  broadcastIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  broadcastTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  broadcastDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  broadcastOverlayActive: {
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  broadcastActionsBottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  stopActionBtnText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
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

