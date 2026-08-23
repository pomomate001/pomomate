import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AuroraEffect() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: false,
      })
    ).start();
  }, [anim]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[
        StyleSheet.absoluteFill,
        { 
          opacity: 0.4,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -50, 0] }) },
            { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 30, 0] }) }
          ]
        }
      ]}>
        <LinearGradient
          colors={['rgba(74, 255, 179, 0.5)', 'rgba(151, 60, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
