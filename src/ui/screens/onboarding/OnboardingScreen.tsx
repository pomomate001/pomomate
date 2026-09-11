import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors, useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useTranslation } from '../../../i18n';
import { OnboardingCardMock } from './OnboardingCardMock';
import { PomoMateIcon } from '../../components/logo/PomoMateIcon';

interface OnboardingScreenProps {
  onFinish: () => void;
}

interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideData>>(null);

  const slides: SlideData[] = [
    {
      id: 'slide-timer',
      badge: t('onboarding.slide1Badge'),
      title: t('onboarding.slide1Title'),
      subtitle: t('onboarding.slide1Subtitle'),
    },
    {
      id: 'slide-tasks',
      badge: t('onboarding.slide2Badge'),
      title: t('onboarding.slide2Title'),
      subtitle: t('onboarding.slide2Subtitle'),
    },
    {
      id: 'slide-buddy',
      badge: t('onboarding.slide3Badge'),
      title: t('onboarding.slide3Title'),
      subtitle: t('onboarding.slide3Subtitle'),
    },
    {
      id: 'slide-stats',
      badge: t('onboarding.slide4Badge'),
      title: t('onboarding.slide4Title'),
      subtitle: t('onboarding.slide4Subtitle'),
    },
    {
      id: 'slide-rooms',
      badge: t('onboarding.slide5Badge'),
      title: t('onboarding.slide5Title'),
      subtitle: t('onboarding.slide5Subtitle'),
    },
    {
      id: 'slide-profile',
      badge: t('onboarding.slide6Badge'),
      title: t('onboarding.slide6Title'),
      subtitle: t('onboarding.slide6Subtitle'),
    },
  ];

  const triggerHaptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style).catch(() => {});
    }
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      if (index !== currentIndex && index >= 0 && index < slides.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, width, slides.length]
  );

  const goToNext = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      onFinish();
    }
  }, [currentIndex, slides.length, triggerHaptic, onFinish]);

  const goToPrev = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
      setCurrentIndex(prevIdx);
    }
  }, [currentIndex, triggerHaptic]);

  const handleSkip = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onFinish();
  }, [triggerHaptic, onFinish]);

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item, index }: { item: SlideData; index: number }) => {
    return (
      <View style={[styles.slideContainer, { width, paddingTop: spacing.md }]}>
        {/* Top Text Group */}
        <View style={styles.textGroup}>
          <View style={[styles.badgePill, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}35` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{item.badge}</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>

        {/* Mockup Card */}
        <View style={styles.mockCardWrapper}>
          <OnboardingCardMock slideIndex={index} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Subtle ambient gradient overlay */}
      <LinearGradient
        colors={[colors.gradientStart, colors.background, colors.gradientEnd]}
        style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.brandRow}>
          <PomoMateIcon size={30} />
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>PomoMate</Text>
        </View>

        <View style={styles.topActions}>
          <View style={[styles.stepPill, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.stepPillText, { color: colors.textSecondary }]}>
              {currentIndex + 1} / {slides.length}
            </Text>
          </View>

          {!isLastSlide && (
            <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                {t('onboarding.skip')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselList}
      />

      {/* Bottom Controls */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Animated Page Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive
                    ? [styles.activeDot, { backgroundColor: colors.primary }]
                    : [styles.inactiveDot, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }],
                ]}
              />
            );
          })}
        </View>

        {/* Buttons Row */}
        <View style={styles.actionButtonsRow}>
          {currentIndex > 0 ? (
            <Pressable
              onPress={goToPrev}
              style={[
                styles.prevButton,
                { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
              ]}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}

          <Pressable
            onPress={goToNext}
            style={[styles.nextButtonOuter, isLastSlide ? styles.nextButtonFull : {}]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || colors.primary]}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.nextButtonText, { color: colors.textInverse }]}>
                {isLastSlide ? t('onboarding.start') : t('onboarding.next')}
              </Text>
              <Ionicons
                name={isLastSlide ? 'rocket-outline' : 'arrow-forward'}
                size={18}
                color={colors.textInverse}
                style={{ marginLeft: 6 }}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  stepPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  carouselList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.sm,
  },
  mockCardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  prevButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonOuter: {
    flex: 1,
    height: 50,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
