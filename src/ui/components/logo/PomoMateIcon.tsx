import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

export interface PomoMateIconProps {
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Official PomoMate App Icon Component (SVG vector).
 * Renders the tomato rounded square with friendly face & play triangle.
 */
export function PomoMateIcon({ size = 48, borderRadius, style }: PomoMateIconProps) {
  const rx = borderRadius ?? Math.round(size * 0.22);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
        <Defs>
          <LinearGradient id="pomoIconGrad" x1="50" y1="50" x2="974" y2="974" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FC1717" />
            <Stop offset="0.55" stopColor="#F61919" />
            <Stop offset="1" stopColor="#F31A19" />
          </LinearGradient>
        </Defs>
        <Rect width="1024" height="1024" rx={Math.round((rx / size) * 1024)} fill="url(#pomoIconGrad)" />
        <G transform="translate(512, 512) scale(0.78) translate(-684, -561)">
          {/* Eyes */}
          <Circle cx="507.5" cy="366" r="110" fill="#FFFFFF" />
          <Circle cx="858" cy="366" r="110" fill="#FFFFFF" />
          {/* Smile with Play Button cutout */}
          <Path
            d="M 304,537 L 304,573 L 307,600 L 316,642 L 324,667 L 338,700 L 354,730 L 376,763 L 405,798 L 428,821 L 462,849 L 520,884 L 561,901 L 595,911 L 633,918 L 666,921 L 701,921 L 734,918 L 763,913 L 803,902 L 843,886 L 875,869 L 904,850 L 935,825 L 981,777 L 1008,740 L 1025,711 L 1041,677 L 1052,646 L 1061,610 L 1066,570 L 1066,538 L 1062,532 L 1053,529 L 717,530 L 720,535 L 924,685 L 933,693 L 934,697 L 914,719 L 882,747 L 861,763 L 821,788 L 783,805 L 751,815 L 714,822 L 686,824 L 682,820 L 683,530 L 312,530 Z"
            fill="#FFFFFF"
          />
        </G>
      </Svg>
    </View>
  );
}
