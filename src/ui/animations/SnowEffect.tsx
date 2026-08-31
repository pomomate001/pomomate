import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const NUM_FLAKES = 16;

const FLAKES = Array.from({ length: NUM_FLAKES }, (_, i) => ({
  id: i,
  left: `${((i * 19) % 94) + 3}%`,
  size: 3 + (i % 4) * 1.5,
  duration: 3200 + (i % 6) * 450,
  delay: (i * 350) % 2500,
  swayDistance: (i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 6),
  opacity: 0.3 + (i % 3) * 0.15,
}));

function Snowflake({ flake }: { flake: typeof FLAKES[0] }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const timer = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: flake.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }, flake.delay);

    return () => {
      clearTimeout(timer);
      if (loop) loop.stop();
    };
  }, [anim, flake.delay, flake.duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, screenHeight + 30],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, flake.swayDistance, 0, -flake.swayDistance, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: flake.size,
        height: flake.size,
        borderRadius: flake.size / 2,
        backgroundColor: '#FFFFFF',
        opacity: flake.opacity,
        left: flake.left as any,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

export const SnowEffect = React.memo(function SnowEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {FLAKES.map((flake) => (
        <Snowflake key={flake.id} flake={flake} />
      ))}
    </View>
  );
});
