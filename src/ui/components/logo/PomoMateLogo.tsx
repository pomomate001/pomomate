import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import Svg, { Rect, Circle, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../theme';

export interface PomoMateLogoProps {
  /**
   * 'light': Red background with white text & icon (pomomate-light.svg)
   * 'dark': White framed card with red icon & dark text (pomomate-dark.svg)
   * 'auto': Automatically uses 'light' in dark mode and 'dark' in light mode (or vice-versa)
   */
  variant?: 'light' | 'dark' | 'auto';
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Official PomoMate Horizontal Brand Logo Component (SVG vector).
 * Faithfully implements pomomate-light.svg and pomomate-dark.svg.
 */
export function PomoMateLogo({
  variant = 'auto',
  width = 200,
  height,
  style,
}: PomoMateLogoProps) {
  const { theme } = useTheme();

  // Aspect ratio is 400:120 (3.333:1)
  const resolvedHeight = height ?? Math.round((width * 120) / 400);

  const resolvedVariant =
    variant === 'auto' ? (theme.dark ? 'light' : 'dark') : variant;

  return (
    <View style={[{ width, height: resolvedHeight }, style]}>
      {resolvedVariant === 'light' ? (
        // Red background variant (pomomate-light.svg)
        <Svg width={width} height={resolvedHeight} viewBox="0 0 400 120" fill="none">
          <Rect x="0" y="0" width="400" height="120" rx="24" fill="#ef4435" />
          <Circle cx="54" cy="44" r="9" fill="#ffffff" />
          <Circle cx="86" cy="44" r="9" fill="#ffffff" />
          <Path d="M 42 58 A 28 28 0 0 0 98 58 Z" fill="#ffffff" />
          <Polygon points="73,58 73,80 92,69" fill="#ef4435" />
          <SvgText
            x="130"
            y="76"
            fontSize="44"
            fontWeight="600"
            fill="#ffffff"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          >
            PomoMate
          </SvgText>
        </Svg>
      ) : (
        // Framed white card variant (pomomate-dark.svg)
        <Svg width={width} height={resolvedHeight} viewBox="0 0 400 120" fill="none">
          <Rect
            x="2"
            y="2"
            width="396"
            height="116"
            rx="24"
            fill="#ffffff"
            stroke="#f0f0f0"
            strokeWidth="2"
          />
          <Rect x="20" y="20" width="80" height="80" rx="20" fill="#ef4435" />
          <Circle cx="44" cy="44" r="9" fill="#ffffff" />
          <Circle cx="76" cy="44" r="9" fill="#ffffff" />
          <Path d="M 32 58 A 28 28 0 0 0 88 58 Z" fill="#ffffff" />
          <Polygon points="63,58 63,80 82,69" fill="#ef4435" />
          <SvgText
            x="120"
            y="76"
            fontSize="44"
            fontWeight="600"
            fill="#1a1a1a"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          >
            PomoMate
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
