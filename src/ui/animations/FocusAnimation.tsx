import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { CampfireAnimation } from './CampfireAnimation';
import { useColors } from '../../theme';

interface FocusAnimationProps {
  animationId: string;
  size?: number;
}

export const FocusAnimation: React.FC<FocusAnimationProps> = ({
  animationId,
  size = 220,
}) => {
  const colors = useColors();
  
  // Gentle breathing/scale animation for static image characters
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.025,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathAnim]);

  switch (animationId) {
    case 'cat_tail':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/cat_tail.json')}
            autoPlay
            loop
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'campfire_lottie':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('./campfire.json')}
            autoPlay
            loop
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'camping_marshmallow':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/camping_marshmallow.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'cat_table_right':
      return (
        <Animated.View
          style={[
            styles.container,
            { width: size, height: size, backgroundColor: colors.background, borderRadius: 28, transform: [{ scale: breathAnim }] },
          ]}
        >
          <Image
            source={require('../../assets/animations/cat_table_right.png')}
            style={{ width: size, height: size, borderRadius: 28 }}
            resizeMode="contain"
          />
        </Animated.View>
      );

    case 'cat_table_left':
      return (
        <Animated.View
          style={[
            styles.container,
            { width: size, height: size, backgroundColor: colors.background, borderRadius: 28, transform: [{ scale: breathAnim }] },
          ]}
        >
          <Image
            source={require('../../assets/animations/cat_table_left.png')}
            style={{ width: size, height: size, borderRadius: 28 }}
            resizeMode="contain"
          />
        </Animated.View>
      );

    case 'campfire_svg':
    default:
      return <CampfireAnimation size={size} />;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
