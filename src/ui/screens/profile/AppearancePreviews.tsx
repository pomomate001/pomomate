import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppTheme } from '../../theme/themes';
import { useColors } from '../../theme';
import { CampfireAnimation } from '../../animations/CampfireAnimation';
import { SvgWebAnimation } from '../../animations/SvgWebAnimation';
import { getSleepingCatSvg } from '../../animations/catSvgData';

/* ─── 1. VIDEO BACKGROUND PREVIEWS ─── */

export function VideoWindmillPreview() {
  return (
    <LinearGradient
      colors={['#2D5A27', '#E8A838', '#4A7C59']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      <View style={styles.centerIconWrap}>
        <Ionicons name="leaf-outline" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.liveBadge}>
        <View style={[styles.liveDot, { backgroundColor: '#FF4D4D' }]} />
        <Text style={styles.liveText}>CANLI</Text>
      </View>
    </LinearGradient>
  );
}

export function VideoSkyPreview() {
  return (
    <LinearGradient
      colors={['#1E88E5', '#64B5F6', '#BBDEFB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.previewContainer}
    >
      <View style={styles.centerIconWrap}>
        <Ionicons name="cloudy-outline" size={30} color="#FFFFFF" />
      </View>
      <View style={styles.liveBadge}>
        <View style={[styles.liveDot, { backgroundColor: '#FF4D4D' }]} />
        <Text style={styles.liveText}>CANLI</Text>
      </View>
    </LinearGradient>
  );
}

export function VideoRainPreview() {
  return (
    <LinearGradient
      colors={['#1A2639', '#2E4057', '#3F5E78']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      <View style={styles.centerIconWrap}>
        <Ionicons name="rainy-outline" size={30} color="#7ED6DF" />
      </View>
      <View style={styles.liveBadge}>
        <View style={[styles.liveDot, { backgroundColor: '#FF4D4D' }]} />
        <Text style={styles.liveText}>CANLI</Text>
      </View>
    </LinearGradient>
  );
}

/* ─── 2. STATIC IMAGE WALLPAPER PREVIEW ─── */

export function PixelArtPreview() {
  return (
    <View style={styles.previewContainer}>
      <Image
        source={require('../../../assets/picture/pixel_art.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.imageOverlay} />
      <View style={styles.centerIconWrap}>
        <Ionicons name="image-outline" size={24} color="#FFFFFF" />
      </View>
    </View>
  );
}

/* ─── 3. PARTICLE & AMBIENT EFFECT PREVIEWS ─── */

export function EffectNonePreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <Ionicons name="ban-outline" size={26} color={colors.textDisabled} />
    </View>
  );
}

export function EffectParticlesPreview() {
  return (
    <LinearGradient
      colors={['#1F1D36', '#3F3356', '#261C40']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      {/* Decorative sparkle dots */}
      <View style={[styles.sparkleDot, { top: 12, left: 16, width: 4, height: 4 }]} />
      <View style={[styles.sparkleDot, { bottom: 14, right: 18, width: 6, height: 6 }]} />
      <View style={[styles.sparkleDot, { top: 16, right: 28, width: 3, height: 3 }]} />
      <View style={[styles.sparkleDot, { bottom: 20, left: 24, width: 5, height: 5 }]} />
      <Ionicons name="sparkles" size={28} color="#FFD166" />
    </LinearGradient>
  );
}

export function EffectRainPreview() {
  return (
    <LinearGradient
      colors={['#102A43', '#243B53', '#334E68']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      {/* Falling rain streaks */}
      <View style={[styles.rainDrop, { top: 10, left: 18 }]} />
      <View style={[styles.rainDrop, { top: 22, left: 32 }]} />
      <View style={[styles.rainDrop, { top: 8, right: 24 }]} />
      <View style={[styles.rainDrop, { top: 28, right: 38 }]} />
      <Ionicons name="water" size={26} color="#64B5F6" />
    </LinearGradient>
  );
}

export function EffectSnowPreview() {
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      {/* Snow crystal dots */}
      <View style={[styles.snowFlake, { top: 10, left: 14 }]} />
      <View style={[styles.snowFlake, { top: 24, left: 28, opacity: 0.6 }]} />
      <View style={[styles.snowFlake, { top: 12, right: 20 }]} />
      <View style={[styles.snowFlake, { bottom: 12, right: 32, opacity: 0.7 }]} />
      <Ionicons name="snow" size={26} color="#E0F2FE" />
    </LinearGradient>
  );
}

export function EffectBubblesPreview() {
  return (
    <LinearGradient
      colors={['#004D40', '#00796B', '#00897B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.previewContainer}
    >
      {/* Floating bubbles */}
      <View style={[styles.bubbleCircle, { width: 14, height: 14, top: 10, left: 16 }]} />
      <View style={[styles.bubbleCircle, { width: 8, height: 8, top: 28, left: 26 }]} />
      <View style={[styles.bubbleCircle, { width: 18, height: 18, bottom: 12, right: 18 }]} />
      <View style={[styles.bubbleCircle, { width: 10, height: 10, top: 14, right: 28 }]} />
      <Ionicons name="ellipse-outline" size={28} color="#80CBC4" />
    </LinearGradient>
  );
}

/* ─── 4. FOCUS ANIMATION PREVIEWS ─── */

export function FocusNonePreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <Ionicons name="timer-outline" size={28} color={colors.textDisabled} />
    </View>
  );
}

export function FocusCatTailPreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <LottieView
        source={require('../../../assets/animations/cat_tail.json')}
        autoPlay
        loop
        style={styles.lottieThumb}
      />
    </View>
  );
}

export function FocusCatTableRightPreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <SvgWebAnimation
        svgContent={getSleepingCatSvg('transparent')}
        size={54}
        backgroundColor="transparent"
      />
    </View>
  );
}

export function FocusCampfireSvgPreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <CampfireAnimation size={54} />
    </View>
  );
}

export function FocusCampfireLottiePreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <LottieView
        source={require('../../animations/campfire.json')}
        autoPlay
        loop
        style={styles.lottieThumb}
      />
    </View>
  );
}

export function FocusCampingMarshmallowPreview() {
  const colors = useColors();
  return (
    <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
      <LottieView
        source={require('../../../assets/animations/camping_marshmallow.json')}
        autoPlay
        loop
        renderMode="SOFTWARE"
        style={styles.lottieThumb}
      />
    </View>
  );
}

/* ─── 5. THEME MINI MOCKUP PREVIEWS ─── */

export function ThemeMockupPreview({ theme }: { theme: AppTheme }) {
  const c = theme.colors;
  return (
    <View style={[styles.themeMockup, { backgroundColor: c.background, borderColor: c.border }]}>
      {/* Mini App Bar */}
      <View style={[styles.mockupHeader, { backgroundColor: c.surface }]}>
        <View style={[styles.mockupDot, { backgroundColor: c.primary }]} />
        <View style={[styles.mockupBar, { backgroundColor: c.textSecondary, opacity: 0.5 }]} />
      </View>

      {/* Mini Center Timer Circle */}
      <View style={styles.mockupBody}>
        <View style={[styles.mockupTimerCircle, { borderColor: c.primary, backgroundColor: c.surface }]}>
          <Text style={[styles.mockupTimerText, { color: c.textPrimary }]}>25:00</Text>
        </View>
      </View>

      {/* Mini Bottom Palette Dots */}
      <View style={styles.mockupFooter}>
        <View style={[styles.paletteDot, { backgroundColor: c.primary }]} />
        <View style={[styles.paletteDot, { backgroundColor: c.accent }]} />
        <View style={[styles.paletteDot, { backgroundColor: c.surfaceVariant }]} />
      </View>
    </View>
  );
}

/* ─── 6. TIMER FACE SHAPE PREVIEWS ─── */

export function TimerDesignPreview({ designId }: { designId: string }) {
  const colors = useColors();
  const primaryColor = colors.primary;

  switch (designId) {
    case 'circle':
      return (
        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Svg width={46} height={46} viewBox="0 0 46 46">
            <Circle cx="23" cy="23" r="19" stroke={colors.border} strokeWidth="3" fill="none" />
            <Circle
              cx="23"
              cy="23"
              r="19"
              stroke={primaryColor}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="120"
              strokeDashoffset="35"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );

    case 'digital':
      return (
        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.digitalBox, { borderColor: primaryColor, backgroundColor: colors.surface }]}>
            <Text style={[styles.digitalText, { color: primaryColor }]}>25:00</Text>
          </View>
        </View>
      );

    case 'arc':
      return (
        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Svg width={48} height={48} viewBox="0 0 48 48">
            {/* Background Track Arc (240 deg) */}
            <Circle
              cx="24"
              cy="24"
              r="18"
              stroke={colors.border}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="75.4 113.1"
              transform="rotate(150 24 24)"
            />
            {/* Active Progress Arc */}
            <Circle
              cx="24"
              cy="24"
              r="18"
              stroke={primaryColor}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="52.8 113.1"
              transform="rotate(150 24 24)"
            />
          </Svg>
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textPrimary, marginTop: -2 }}>25m</Text>
          </View>
        </View>
      );

    case 'neon':
      return (
        <View style={[styles.previewContainer, { backgroundColor: '#0A0A0A' }]}>
          <Svg width={46} height={46} viewBox="0 0 46 46">
            <Circle cx="23" cy="23" r="19" stroke={primaryColor} strokeWidth="1.5" fill="none" opacity={0.4} />
            <Circle cx="23" cy="23" r="16" stroke={primaryColor} strokeWidth="3" fill="none" />
          </Svg>
        </View>
      );

    case 'minimal':
    default:
      return (
        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.minimalText, { color: colors.textPrimary }]}>25:00</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  previewContainer: {
    width: '100%',
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  centerIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sparkleDot: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 3,
    opacity: 0.8,
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#7ED6DF',
    borderRadius: 1,
    opacity: 0.75,
    transform: [{ rotate: '15deg' }],
  },
  snowFlake: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.9,
  },
  bubbleCircle: {
    position: 'absolute',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  lottieThumb: {
    width: 60,
    height: 60,
  },
  themeMockup: {
    width: '100%',
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  mockupBar: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  mockupBody: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  mockupTimerCircle: {
    width: 48,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupTimerText: {
    fontSize: 9,
    fontWeight: '700',
  },
  mockupFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  paletteDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  digitalBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  digitalText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  minimalText: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
