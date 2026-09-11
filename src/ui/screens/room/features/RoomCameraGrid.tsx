import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { Avatar } from '../../../components/Avatar';

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

/**
 * Helper to arrange participants into rows according to count:
 * - 1 user  -> 1 row of 1 (fills screen)
 * - 2 users -> 2 rows of 1 (alt alta 2)
 * - 3 users -> 3 rows of 1 (alt alta 3'e bölme)
 * - 4 users -> 2 rows of 2 (2x2 grid)
 * - 5 users -> 3 rows (2, 2, 1)
 * - 6 users -> 3 rows of 2 (3x2 grid)
 * - >6 users -> fallback rows of 2
 */
function getLayoutRows<T>(items: T[]): T[][] {
  const count = items.length;
  if (count <= 1) {
    return items.length > 0 ? [[items[0]]] : [];
  }
  if (count === 2) {
    return [[items[0]], [items[1]]];
  }
  if (count === 3) {
    return [[items[0]], [items[1]], [items[2]]];
  }
  if (count === 4) {
    return [
      [items[0], items[1]],
      [items[2], items[3]],
    ];
  }
  if (count === 5) {
    return [
      [items[0], items[1]],
      [items[2], items[3]],
      [items[4]],
    ];
  }
  if (count === 6) {
    return [
      [items[0], items[1]],
      [items[2], items[3]],
      [items[4], items[5]],
    ];
  }
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

function getParticipantSizes(isCompact: boolean, count: number) {
  if (isCompact) {
    return {
      avatarSize: 40,
      nameFontSize: 10,
      placeholderIconSize: 28,
      badgeSize: 16,
      badgeIconSize: 8,
      badgeMarginTop: 4,
    };
  }

  if (count <= 1) {
    return {
      avatarSize: 104,
      nameFontSize: 15,
      placeholderIconSize: 64,
      badgeSize: 24,
      badgeIconSize: 12,
      badgeMarginTop: 8,
    };
  }

  if (count === 2) {
    return {
      avatarSize: 84,
      nameFontSize: 14,
      placeholderIconSize: 56,
      badgeSize: 22,
      badgeIconSize: 11,
      badgeMarginTop: 8,
    };
  }

  if (count === 3) {
    return {
      avatarSize: 68,
      nameFontSize: 13,
      placeholderIconSize: 48,
      badgeSize: 20,
      badgeIconSize: 10,
      badgeMarginTop: 6,
    };
  }

  if (count === 4) {
    return {
      avatarSize: 64,
      nameFontSize: 12,
      placeholderIconSize: 44,
      badgeSize: 20,
      badgeIconSize: 10,
      badgeMarginTop: 6,
    };
  }

  // count >= 5
  return {
    avatarSize: 52,
    nameFontSize: 11,
    placeholderIconSize: 36,
    badgeSize: 18,
    badgeIconSize: 9,
    badgeMarginTop: 4,
  };
}

function renderParticipant(p: Participant, isCompact: boolean, totalCount: number) {
  // If we have a MediaStream with video tracks, use RTCView
  const streamURL = p.stream && p.stream.toURL ? p.stream.toURL() : null;
  const sizes = getParticipantSizes(isCompact, totalCount);

  return (
    <View key={p.userId} style={isCompact ? styles.compactCell : styles.fullCell}>
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
            <Ionicons name="videocam-outline" size={sizes.placeholderIconSize} color="rgba(255,255,255,0.2)" />
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Avatar 
              uri={p.avatarUrl} 
              name={p.displayName} 
              size={sizes.avatarSize} 
            />
            {/* Media status badges */}
            <View style={[styles.badgeRow, { marginTop: sizes.badgeMarginTop }]}>
              <View
                style={[
                  styles.mediaBadge,
                  {
                    width: sizes.badgeSize,
                    height: sizes.badgeSize,
                    borderRadius: sizes.badgeSize / 2,
                    backgroundColor: '#E53935',
                  },
                ]}
              >
                <Ionicons name="videocam-off" size={sizes.badgeIconSize} color="#FFF" />
              </View>
              <View
                style={[
                  styles.mediaBadge,
                  {
                    width: sizes.badgeSize,
                    height: sizes.badgeSize,
                    borderRadius: sizes.badgeSize / 2,
                    backgroundColor: p.hasMic ? '#4CAF50' : '#E53935',
                  },
                ]}
              >
                <Ionicons
                  name={p.hasMic ? 'mic' : 'mic-off'}
                  size={sizes.badgeIconSize}
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
          <Text style={[styles.nameText, { fontSize: sizes.nameFontSize }]} numberOfLines={1}>
            {p.displayName}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const RoomCameraGrid: React.FC<RoomCameraGridProps> = ({ participants, isCompact = false }) => {
  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compactScroll}>
          {participants.map((p) => renderParticipant(p, true, participants.length))}
        </ScrollView>
      </View>
    );
  }

  const rows = getLayoutRows(participants);

  return (
    <View style={styles.fullGridContainer}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((p) => renderParticipant(p, false, participants.length))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    paddingVertical: 8,
  },
  compactScroll: {
    paddingHorizontal: 8,
    gap: 8,
  },
  compactCell: {
    width: 100,
    aspectRatio: 4 / 3,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullGridContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 6,
    gap: 6,
  },
  gridRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    gap: 6,
  },
  fullCell: {
    flex: 1,
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cellContent: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  nameText: {
    color: '#FFF',
    fontWeight: '500',
  },
  videoView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
