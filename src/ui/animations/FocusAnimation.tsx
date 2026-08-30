import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { CampfireAnimation } from './CampfireAnimation';
import { SvgWebAnimation } from './SvgWebAnimation';
import { getSleepingCatSvg, getWalkingCatSvg } from './catSvgData';

interface FocusAnimationProps {
  animationId: string;
  size?: number;
}

export const FocusAnimation: React.FC<FocusAnimationProps> = ({
  animationId,
  size = 220,
}) => {
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
        <SvgWebAnimation
          svgContent={getSleepingCatSvg('transparent')}
          size={size}
          backgroundColor="transparent"
        />
      );

    case 'cat_table_left':
      return (
        <SvgWebAnimation
          svgContent={getWalkingCatSvg('transparent')}
          size={size}
          backgroundColor="transparent"
        />
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
