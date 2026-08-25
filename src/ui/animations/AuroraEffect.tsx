import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const AuroraEffect = React.memo(function AuroraEffect() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true, // Native driver is hardware accelerated and never blocks JS thread!
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.35,
            transform: [{ translateY }, { translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(74, 255, 179, 0.4)', 'rgba(151, 60, 255, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});
