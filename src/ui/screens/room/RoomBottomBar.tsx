import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ParticipantsBar } from './ParticipantsBar';
import { useColors } from '../../theme';

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface RoomBottomBarProps {
  roomName: string;
  inviteCode: string;
  isLive: boolean;
  participants: Participant[];
  micOn: boolean;
  camOn: boolean;
  screenShareOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  onShare: () => void;
  onLeave: () => void;
}

const EXPANDED_HEIGHT = 220;
const COLLAPSED_HEIGHT = 120;

export const RoomBottomBar: React.FC<RoomBottomBarProps> = ({
  roomName,
  inviteCode,
  isLive,
  participants,
  micOn,
  camOn,
  screenShareOn,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
  onShare,
  onLeave,
}) => {
  const colors = useColors();
  const height = useSharedValue(EXPANDED_HEIGHT);
  const startHeight = useSharedValue(EXPANDED_HEIGHT);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = height.value;
    })
    .onUpdate((event) => {
      // Dragging down (positive translationY) should decrease height (collapse)
      const newHeight = startHeight.value - event.translationY;
      if (newHeight >= COLLAPSED_HEIGHT && newHeight <= EXPANDED_HEIGHT) {
        height.value = newHeight;
      }
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || height.value < (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2) {
        height.value = withSpring(COLLAPSED_HEIGHT, { damping: 15, stiffness: 100 });
      } else {
        height.value = withSpring(EXPANDED_HEIGHT, { damping: 15, stiffness: 100 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  const topSectionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
      [-20, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
      display: height.value <= COLLAPSED_HEIGHT + 10 ? 'none' : 'flex',
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle, { backgroundColor: 'rgba(20, 20, 20, 0.85)' }]}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <Animated.View style={[styles.topSection, topSectionStyle]}>
          <View style={styles.headerRow}>
            {isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>CANLI</Text>
              </View>
            )}
            <Text style={[styles.roomName, { color: colors.textPrimary || '#FFF' }]}>{roomName}</Text>
            <View style={styles.invitePill}>
              <Text style={styles.inviteText}>{inviteCode}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          {/* Use ParticipantBar if it was actually available here, rendering placeholder if not present */}
          <ParticipantsBar participants={participants} />

          <View style={styles.controlsRow}>
            <Pressable
              style={[styles.controlButton, { backgroundColor: micOn ? 'rgba(255,255,255,0.2)' : 'rgba(255,50,50,0.8)' }]}
              onPress={onToggleMic}
            >
              <Ionicons name={micOn ? 'mic' : 'mic-off'} size={24} color="#FFF" />
            </Pressable>
            
            <Pressable
              style={[styles.controlButton, { backgroundColor: camOn ? 'rgba(255,255,255,0.2)' : 'rgba(255,50,50,0.8)' }]}
              onPress={onToggleCam}
            >
              <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={24} color="#FFF" />
            </Pressable>

            <Pressable
              style={[styles.controlButton, { backgroundColor: screenShareOn ? 'rgba(76,175,80,0.8)' : 'rgba(255,255,255,0.2)' }]}
              onPress={onToggleScreen}
            >
              <Ionicons name={screenShareOn ? 'desktop' : 'desktop-outline'} size={24} color="#FFF" />
            </Pressable>

            <Pressable
              style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={onShare}
            >
              <Ionicons name="share-outline" size={24} color="#FFF" />
            </Pressable>

            <Pressable
              style={[styles.controlButton, { backgroundColor: '#E53935' }]}
              onPress={onLeave}
            >
              <Ionicons name="call" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  liveBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
  },
  invitePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inviteText: {
    color: '#FFF',
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
