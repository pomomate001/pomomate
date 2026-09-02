import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

type ToggleKey = 'timer' | 'screen' | 'cameras';

interface RoomViewTogglesProps {
  viewToggles: {
    timer: boolean;
    screen: boolean;
    cameras: boolean;
  };
  onToggle: (key: ToggleKey) => void;
  showShrinkToggle?: boolean;
  isShrunk?: boolean;
  onToggleShrink?: () => void;
  onEnterPiP?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ToggleButton = ({
  icon,
  iconOutline,
  color,
  isActive,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  color: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          backgroundColor: isActive ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
          borderColor: isActive ? color : 'transparent',
          borderWidth: 2,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={isActive ? icon : iconOutline} size={20} color={isActive ? color : '#FFFFFF'} />
    </AnimatedPressable>
  );
};

export const RoomViewToggles: React.FC<RoomViewTogglesProps> = ({ 
  viewToggles, 
  onToggle,
  showShrinkToggle = false,
  isShrunk = false,
  onToggleShrink,
  onEnterPiP,
}) => {
  return (
    <View style={styles.container}>
      <ToggleButton
        icon="timer"
        iconOutline="timer-outline"
        color="#FFB800"
        isActive={viewToggles.timer}
        onPress={() => onToggle('timer')}
      />
      <ToggleButton
        icon="desktop"
        iconOutline="desktop-outline"
        color="#FFFFFF"
        isActive={viewToggles.screen}
        onPress={() => onToggle('screen')}
      />
      <ToggleButton
        icon="videocam"
        iconOutline="videocam-outline"
        color="#4CAF50"
        isActive={viewToggles.cameras}
        onPress={() => onToggle('cameras')}
      />
      {onEnterPiP && (
        <ToggleButton
          icon="contract"
          iconOutline="contract-outline"
          color="#A855F7"
          isActive={false}
          onPress={onEnterPiP}
        />
      )}
      {showShrinkToggle && onToggleShrink && (
        <ToggleButton
          icon="expand"
          iconOutline="contract"
          color="#00BCD4"
          isActive={isShrunk}
          onPress={onToggleShrink}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -60 }],
    gap: 8,
    zIndex: 10,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
