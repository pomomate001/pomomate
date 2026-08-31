import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useColors } from '../theme';

const { height: screenHeight } = Dimensions.get('window');
const NUM_DROPS = 18;

// Deterministic properties — zero overhead on JS thread
const DROPS = Array.from({ length: NUM_DROPS }, (_, i) => ({
  id: i,
  left: `${((i * 23) % 94) + 3}%`,
  height: 14 + (i % 4) * 4,
  duration: 650 + (i % 5) * 80,
  delay: (i * 120) % 900,
  opacity: 0.25 + (i % 3) * 0.12,
}));

function RainDrop({ drop, color }: { drop: typeof DROPS[0]; color: string }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const timer = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: drop.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }, drop.delay);

    return () => {
      clearTimeout(timer);
      if (loop) loop.stop();
    };
  }, [anim, drop.delay, drop.duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, screenHeight + 40],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 2,
        height: drop.height,
        backgroundColor: color,
        opacity: drop.opacity,
        left: drop.left as any,
        borderRadius: 1,
        transform: [{ translateY }, { translateX }, { rotate: '12deg' }],
      }}
    />
  );
}

export const RainEffect = React.memo(function RainEffect() {
  const colors = useColors();
  const rainColor = colors.info || '#64B5F6';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {DROPS.map((drop) => (
        <RainDrop key={drop.id} drop={drop} color={rainColor} />
      ))}
    </View>
  );
});
