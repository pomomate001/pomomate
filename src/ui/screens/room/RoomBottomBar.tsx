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
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

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

const EXPANDED_HEIGHT = 240;
const COLLAPSED_HEIGHT = 110;

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
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const height = useSharedValue(EXPANDED_HEIGHT);
  const startHeight = useSharedValue(EXPANDED_HEIGHT);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = height.value;
    })
    .onUpdate((event) => {
      // Dragging down decreases height (collapse)
      const newHeight = startHeight.value - event.translationY;
      if (newHeight >= COLLAPSED_HEIGHT && newHeight <= EXPANDED_HEIGHT) {
        height.value = newHeight;
      }
    })
    .onEnd((event) => {
      if (event.velocityY > 400 || height.value < (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2) {
        height.value = withSpring(COLLAPSED_HEIGHT, { damping: 18, stiffness: 120 });
      } else {
        height.value = withSpring(EXPANDED_HEIGHT, { damping: 18, stiffness: 120 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value + insets.bottom,
    };
  });

  const topSectionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT - 30],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      height.value,
      [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
      [-15, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
      display: height.value <= COLLAPSED_HEIGHT + 15 ? 'none' : 'flex',
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            backgroundColor: colors.surface ? `${colors.surface}F0` : 'rgba(24, 24, 28, 0.95)',
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.xs,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border || 'rgba(255, 255, 255, 0.3)' }]} />
        </View>

        {/* Room Header Info (Shown in Expanded) */}
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

        {/* Participants Bar */}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: '700',
    maxWidth: 160,
  },
  invitePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  inviteText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  participantsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
