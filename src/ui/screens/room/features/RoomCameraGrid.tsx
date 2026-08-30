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
  hasMic?: boolean;
  stream?: MediaStream | null;
  isLocal?: boolean;
}

interface RoomCameraGridProps {
  participants: Participant[];
  isCompact?: boolean;
}

export const RoomCameraGrid: React.FC<RoomCameraGridProps> = ({ participants, isCompact = false }) => {
  const colors = useColors();

  const Content = () => (
    <>
      {participants.map((p) => {
        // If we have a MediaStream with video tracks, use RTCView
        const streamURL = p.stream && p.stream.toURL ? p.stream.toURL() : null;

        return (
          <View key={p.userId} style={[styles.cellContainer, isCompact && styles.compactCell]}>
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
                  {/* Media status badges */}
                  <View style={styles.badgeRow}>
                    <View style={[styles.mediaBadge, { backgroundColor: '#E53935' }]}>
                      <Ionicons name="videocam-off" size={10} color="#FFF" />
                    </View>
                    <View
                      style={[
                        styles.mediaBadge,
                        { backgroundColor: p.hasMic ? '#4CAF50' : '#E53935' },
                      ]}
                    >
                      <Ionicons
                        name={p.hasMic ? 'mic' : 'mic-off'}
                        size={10}
                        color="#FFF"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Camera-on media badges overlay */}
              {(streamURL || p.hasCamera) && (
                <View style={styles.mediaOverlayBadges}>
                  <View
                    style={[
                      styles.mediaBadgeSmall,
                      { backgroundColor: p.hasMic ? '#4CAF50' : '#E53935' },
                    ]}
                  >
                    <Ionicons
                      name={p.hasMic ? 'mic' : 'mic-off'}
                      size={10}
                      color="#FFF"
                    />
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
    </>
  );

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compactScroll}>
          <Content />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <Content />
    </View>
  );
};

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  compactContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  compactScroll: {
    paddingHorizontal: 8,
    gap: 8,
  },
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
  compactCell: {
    width: 120,
    marginBottom: 0,
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
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  mediaBadge: {
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.8)',
  },
  mediaOverlayBadges: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 3,
  },
  mediaBadgeSmall: {
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
