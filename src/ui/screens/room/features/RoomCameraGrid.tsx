import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { Avatar } from '../../../components/Avatar';
import { useColors } from '../../../theme';

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  hasCamera?: boolean;
  stream?: MediaStream | null;
  isLocal?: boolean;
}

interface RoomCameraGridProps {
  participants: Participant[];
}

export const RoomCameraGrid: React.FC<RoomCameraGridProps> = ({ participants }) => {
  const colors = useColors();

  return (
    <View style={styles.grid}>
      {participants.map((p) => {
        // If we have a MediaStream with video tracks, use RTCView
        const streamURL = p.stream && p.stream.toURL ? p.stream.toURL() : null;

        return (
          <View key={p.userId} style={styles.cellContainer}>
            <View style={styles.cellContent}>
              {streamURL ? (
                <RTCView
                  streamURL={streamURL}
                  style={styles.videoView}
                  objectFit="cover"
                  mirror={p.isLocal} // Mirror local camera
                />
              ) : p.hasCamera ? (
                <View style={styles.cameraPlaceholder}>
                  <Ionicons name="videocam-outline" size={48} color="rgba(255,255,255,0.2)" />
                </View>
              ) : (
                <View style={styles.avatarContainer}>
                  <Avatar 
                    uri={p.avatarUrl} 
                    name={p.displayName} 
                    size={64} 
                  />
                  <View style={styles.noCameraBadge}>
                    <Ionicons name="videocam-off" size={12} color="#FFF" />
                  </View>
                </View>
              )}
              
              <View style={styles.nameOverlay}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {p.displayName}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  cellContainer: {
    width: '48%',
    aspectRatio: 4 / 3,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    width: '100%',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  noCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E53935',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  nameText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  videoView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
