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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParticipantsBar } from './ParticipantsBar';
import { RoomChat } from './features/RoomChat';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface RoomBottomBarProps {
  roomId: string;
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

const COLLAPSED_HEIGHT = 100;
const EXPANDED_HEIGHT = 190;
const CHAT_HEIGHT = 520;

export const RoomBottomBar: React.FC<RoomBottomBarProps> = ({
  roomId,
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
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const height = useSharedValue(EXPANDED_HEIGHT);
  const startHeight = useSharedValue(EXPANDED_HEIGHT);

  // Snap to nearest level
  const snapToNearest = (currentHeight: number, velocityY: number) => {
    'worklet';
    const levels = [COLLAPSED_HEIGHT, EXPANDED_HEIGHT, CHAT_HEIGHT];

    // Strong velocity override
    if (velocityY < -600 && currentHeight < CHAT_HEIGHT) {
      // Fast swipe up → go to next level up
      if (currentHeight < EXPANDED_HEIGHT) {
        return EXPANDED_HEIGHT;
      }
      return CHAT_HEIGHT;
    }
    if (velocityY > 600 && currentHeight > COLLAPSED_HEIGHT) {
      // Fast swipe down → go to next level down
      if (currentHeight > EXPANDED_HEIGHT) {
        return EXPANDED_HEIGHT;
      }
      return COLLAPSED_HEIGHT;
    }

    // Snap to nearest
    let closest = levels[0];
    let minDist = Math.abs(currentHeight - levels[0]);
    for (let i = 1; i < levels.length; i++) {
      const dist = Math.abs(currentHeight - levels[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = levels[i];
      }
    }
    return closest;
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = height.value;
    })
    .onUpdate((event) => {
      const newHeight = startHeight.value - event.translationY;
      if (newHeight >= COLLAPSED_HEIGHT && newHeight <= CHAT_HEIGHT) {
        height.value = newHeight;
      }
    })
    .onEnd((event) => {
      const target = snapToNearest(height.value, event.velocityY);
      height.value = withSpring(target, { damping: 20, stiffness: 130 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value + insets.bottom,
  }));

  const topSectionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + 40],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
      [-10, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
      display: height.value <= COLLAPSED_HEIGHT + 10 ? 'none' : 'flex',
    };
  });

  const chatSectionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      height.value,
      [EXPANDED_HEIGHT, EXPANDED_HEIGHT + 60],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      flex: 1,
      display: height.value <= EXPANDED_HEIGHT + 20 ? 'none' : 'flex',
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            backgroundColor: colors.surface ? `${colors.surface}F5` : 'rgba(24, 24, 28, 0.96)',
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.xs,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border || 'rgba(255, 255, 255, 0.3)' }]} />
        </View>

        {/* Room Header Info (shown when expanded) */}
        <Animated.View style={[styles.topSection, topSectionStyle]}>
          <View style={styles.headerRow}>
            {isLive && (
              <View style={[styles.liveBadge, { backgroundColor: colors.error }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>CANLI</Text>
              </View>
            )}
            <Text style={[styles.roomName, { color: colors.textPrimary }]} numberOfLines={1}>
              {roomName}
            </Text>
            <View style={[styles.invitePill, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.inviteText, { color: colors.primary }]}>{inviteCode}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Compact Participants Row */}
        <View style={styles.participantsWrap}>
          <ParticipantsBar participants={participants} />
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: micOn ? colors.surfaceVariant : colors.error }]}
            onPress={onToggleMic}
          >
            <Ionicons name={micOn ? 'mic' : 'mic-off'} size={22} color={micOn ? colors.textPrimary : '#FFF'} />
          </Pressable>
          
          <Pressable
            style={[styles.controlButton, { backgroundColor: camOn ? colors.surfaceVariant : colors.error }]}
            onPress={onToggleCam}
          >
            <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={22} color={camOn ? colors.textPrimary : '#FFF'} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: screenShareOn ? colors.success : colors.surfaceVariant }]}
            onPress={onToggleScreen}
          >
            <Ionicons name={screenShareOn ? 'desktop' : 'desktop-outline'} size={22} color={screenShareOn ? '#FFF' : colors.textPrimary} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={onShare}
          >
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: colors.error }]}
            onPress={onLeave}
          >
            <Ionicons name="call" size={22} color="#FFF" />
          </Pressable>
        </View>

        {/* Chat Section (shown when swiped up past expanded) */}
        <Animated.View style={[styles.chatSection, chatSectionStyle]}>
          <View style={[styles.chatDivider, { backgroundColor: colors.border }]} />
          <RoomChat roomId={roomId} />
        </Animated.View>
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
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 150,
  },
  invitePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  inviteText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  participantsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: spacing.sm,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSection: {
    marginTop: spacing.sm,
  },
  chatDivider: {
    height: 1,
    marginBottom: spacing.xs,
  },
});
