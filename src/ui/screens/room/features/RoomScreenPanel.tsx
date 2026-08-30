import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';

import type { MediaStream } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';

interface SharedFile {
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
  onPickFile: () => void;
  onRemoveFile: () => void;
}

export const RoomScreenPanel: React.FC<RoomScreenPanelProps> = ({
  sharedFile,
  isScreenSharing,
  screenStream,
  isHost,
  onPickFile,
  onRemoveFile,
}) => {
  const colors = useColors();

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
          <Image source={{ uri: sharedFile.uri }} style={styles.imageContent} resizeMode="contain" />
        ) : (
          <View style={styles.fileContent}>
            <Ionicons name="document-text-outline" size={64} color="#FFF" />
            <Text style={styles.fileName}>{sharedFile.fileName}</Text>
          </View>
        )}
        
        {isHost && (
          <Pressable style={styles.closeButton} onPress={onRemoveFile}>
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dropzone}
        onPress={isHost ? onPickFile : undefined}
        disabled={!isHost}
      >
        <Ionicons name="cloud-upload-outline" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.dropzoneText}>
          {isHost ? 'Ekranınızı paylaşın veya dosya yükleyin' : 'Henüz bir içerik paylaşılmadı'}
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
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
