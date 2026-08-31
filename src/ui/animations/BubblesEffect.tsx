import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useColors } from '../theme';

const { height: screenHeight } = Dimensions.get('window');
const NUM_BUBBLES = 12;

const BUBBLES = Array.from({ length: NUM_BUBBLES }, (_, i) => ({
  id: i,
  left: `${((i * 29) % 88) + 6}%`,
  size: 14 + (i % 4) * 8,
  duration: 4500 + (i % 4) * 800,
  delay: (i * 600) % 3600,
  opacity: 0.25 + (i % 3) * 0.1,
}));

function Bubble({ bubble, color }: { bubble: typeof BUBBLES[0]; color: string }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const timer = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: bubble.duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      );
      loop.start();
    }, bubble.delay);

    return () => {
      clearTimeout(timer);
      if (loop) loop.stop();
    };
  }, [anim, bubble.delay, bubble.duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight + 30, -50],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0, 14, -14, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0.6, 1, 1.05, 0.8],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: bubble.size,
        height: bubble.size,
        borderRadius: bubble.size / 2,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: `${color}18`,
        opacity: bubble.opacity,
        left: bubble.left as any,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
}

export const BubblesEffect = React.memo(function BubblesEffect() {
  const colors = useColors();
  const bubbleColor = colors.primary || '#9C27B0';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLES.map((bubble) => (
        <Bubble key={bubble.id} bubble={bubble} color={bubbleColor} />
      ))}
    </View>
  );
});
