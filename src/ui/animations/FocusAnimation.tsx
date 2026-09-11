import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { CampfireAnimation } from './CampfireAnimation';
import { SvgWebAnimation } from './SvgWebAnimation';
import { getSleepingCatSvg } from './catSvgData';

interface FocusAnimationProps {
  animationId: string;
  size?: number;
}

export const FocusAnimation: React.FC<FocusAnimationProps> = ({
  animationId,
  size = 220,
}) => {
  switch (animationId) {
    case 'none':
      return null;

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

    case 'boy_reading':
    case 'study_desk': // Backward compatibility
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Boy Reading.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'bunny_and_dog':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/bunny and dog.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'cozy_night':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Cozy Night.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'girl_reading':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Girl Reading.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'girl_reading_2':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Girl Reading 2.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'study_boy':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Study boy.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'study_girl':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <LottieView
            source={require('../../assets/animations/Study girl.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: size, height: size }}
          />
        </View>
      );

    case 'cat_table_right':
    case 'cat_table_left': // Safe fallback for existing user state
      return (
        <SvgWebAnimation
          svgContent={getSleepingCatSvg('transparent')}
          size={size}
          backgroundColor="transparent"
        />
      );

    case 'campfire_svg':
      return <CampfireAnimation size={size} />;

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
