import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Path, Circle, Ellipse, G, Defs, RadialGradient, Stop,
  Filter, FeGaussianBlur, Rect
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G) as any;

interface CampfireAnimationProps {
  size?: number;
}

export const CampfireAnimation: React.FC<CampfireAnimationProps> = ({ size = 220 }) => {
  const [flameAnim] = useState(() => new Animated.Value(1));
  const [glowAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Alev titreme
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.03, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true
        }),
        Animated.timing(flameAnim, {
          toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true
        }),
      ])
    ).start();

    // Glow pulsate
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.07, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: false
        }),
        Animated.timing(glowAnim, {
          toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: false
        }),
      ])
    ).start();
  }, [flameAnim, glowAnim]);

  return (
    <Svg width={size} height={size} viewBox="0 0 400 400">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ff6b35" stopOpacity="0.35"/>
          <Stop offset="50%" stopColor="#ff6b35" stopOpacity="0.12"/>
          <Stop offset="100%" stopColor="#ff6b35" stopOpacity="0"/>
        </RadialGradient>
        <Filter id="blur">
          <FeGaussianBlur stdDeviation="2"/>
        </Filter>
      </Defs>

      {/* Ground shadow */}
      <Ellipse cx="200" cy="335" rx="90" ry="14" fill="#000" opacity={0.15}/>

      {/* Outer glow */}
      <AnimatedG style={{ transform: [{ scale: glowAnim }] }} origin="200, 280">
        <Circle cx="200" cy="280" r="110" fill="url(#glow)"/>
      </AnimatedG>

      {/* Back logs */}
      <G fill="#5a3a1a" stroke="#3d2610" strokeWidth={1.5}>
        <Rect x="145" y="310" width="110" height="16" rx="4" rotation="-8" origin="200, 318"/>
        <Rect x="145" y="310" width="110" height="16" rx="4" rotation="8" origin="200, 318"/>
      </G>

      {/* Back flame */}
      <Path d="M200,315 Q165,260 185,210 Q200,170 200,140 Q200,170 215,210 Q235,260 200,315" 
            fill="#ff4500" opacity={0.6} filter="url(#blur)"/>

      {/* Middle flame */}
      <AnimatedG style={{ transform: [{ scale: flameAnim }] }} origin="200,315">
        <Path d="M200,315 Q175,270 188,225 Q200,190 200,165 Q200,190 212,225 Q225,270 200,315" 
              fill="#ff7f00" opacity={0.75}/>
      </AnimatedG>

      {/* Front flame */}
      <AnimatedG style={{ transform: [{ scale: flameAnim }] }} origin="200,315">
        <Path d="M200,315 Q185,280 193,245 Q200,220 200,200 Q200,220 207,245 Q215,280 200,315" 
              fill="#ffcc00" opacity={0.9}/>
      </AnimatedG>

      {/* Core */}
      <Path d="M200,315 Q192,295 196,275 Q200,260 200,250 Q200,260 204,275 Q208,295 200,315" 
            fill="#fff5e6" opacity={0.85}/>

      {/* Front logs */}
      <G fill="#6b4423" stroke="#4a2e15" strokeWidth={1.5}>
        <Rect x="155" y="325" width="90" height="14" rx="4" rotation="-14" origin="200, 332"/>
        <Rect x="155" y="325" width="90" height="14" rx="4" rotation="14" origin="200, 332"/>
      </G>

      {/* Log ends */}
      <G fill="#4a2e15" opacity={0.5}>
        <Circle cx="148" cy="318" r="5"/>
        <Circle cx="252" cy="318" r="5"/>
        <Circle cx="154" cy="332" r="5"/>
        <Circle cx="246" cy="332" r="5"/>
      </G>

      {/* Stars */}
      <G fill="#fff" opacity={0.7}>
        <Circle cx="60" cy="50" r="1.5"/>
        <Circle cx="120" cy="80" r="1"/>
        <Circle cx="320" cy="45" r="1.5"/>
        <Circle cx="350" cy="110" r="1"/>
        <Circle cx="280" cy="70" r="1.2"/>
        <Circle cx="80" cy="130" r="1"/>
        <Circle cx="40" cy="95" r="0.8"/>
        <Circle cx="360" cy="75" r="1"/>
      </G>
    </Svg>
  );
};

export default CampfireAnimation;
