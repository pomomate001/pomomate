import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

  // Zoom logic
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Keep the zoomed scale
      savedScale.value = scale.value;
    });

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withTiming(`${rotationMultiplier * 90}deg`) },
        { scale: scale.value }
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
      <View style={styles.container}>
        {isImage ? (
          <GestureDetector gesture={pinchGesture}>
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
            <Pressable 
              style={styles.iconButton} 
              onPress={() => setRotationMultiplier(r => r + 1)}
            >
              <Ionicons name="refresh" size={24} color="#FFF" />
            </Pressable>
          )}
          
          {(isHost || allowFiles) && (
            <Pressable style={styles.iconButton} onPress={onRemoveFile}>
              <Ionicons name="close" size={24} color="#FFF" />
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
