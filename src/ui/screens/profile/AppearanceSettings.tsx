/**
 * Appearance settings — modern card-based theme, timer design,
 * background effects, live videos and focus animation pickers.
 */
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useColors, useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { SectionHeader } from '../../components/SectionHeader';
import { useSettingsStore } from '../../../state';
import { timerDesigns } from '../timer/timerDesigns';
import { backgroundEffects } from '../../animations/backgroundEffects';
import { focusAnimations } from '../../animations/focusAnimations';
import { AppearanceOptionCard } from './AppearanceOptionCard';
import {
  VideoWindmillPreview,
  VideoSkyPreview,
  VideoRainPreview,
  PixelArtPreview,
  EffectNonePreview,
  EffectParticlesPreview,
  EffectRainPreview,
  EffectSnowPreview,
  EffectBubblesPreview,
  FocusNonePreview,
  FocusCatTailPreview,
  FocusCatTableRightPreview,
  FocusCampfireSvgPreview,
  FocusCampfireLottiePreview,
  FocusCampingMarshmallowPreview,
  ThemeMockupPreview,
  TimerDesignPreview,
} from './AppearancePreviews';

export function AppearanceSettings() {
  const colors = useColors();
  const { availableThemes, setThemeId } = useTheme();
  const {
    themeId,
    timerDesignId,
    backgroundEffectId,
    workAnimationId,
    breakAnimationId,
    setThemeId: saveThemeId,
    setTimerDesignId,
    setBackgroundEffectId,
    setWorkAnimationId,
    setBreakAnimationId,
  } = useSettingsStore();

  const handleTheme = (id: string) => {
    saveThemeId(id);
    setThemeId(id);
  };

  const videoBackgrounds = backgroundEffects.filter((e) => e.category === 'video');
  const imageBackgrounds = backgroundEffects.filter((e) => e.category === 'image');
  const otherBackgrounds = backgroundEffects.filter(
    (e) => e.category === 'particle' || e.category === 'none'
  );

  const renderBackgroundPreview = (id: string) => {
    switch (id) {
      case 'video_windmill':
        return <VideoWindmillPreview />;
      case 'video_sky':
        return <VideoSkyPreview />;
      case 'video_rain':
        return <VideoRainPreview />;
      case 'image_pixel_art':
        return <PixelArtPreview />;
      case 'particles':
        return <EffectParticlesPreview />;
      case 'rain':
        return <EffectRainPreview />;
      case 'snow':
        return <EffectSnowPreview />;
      case 'bubbles':
        return <EffectBubblesPreview />;
      case 'none':
      default:
        return <EffectNonePreview />;
    }
  };

  const renderFocusAnimationPreview = (id: string) => {
    switch (id) {
      case 'cat_tail':
        return <FocusCatTailPreview />;
      case 'cat_table_right':
        return <FocusCatTableRightPreview />;
      case 'campfire_svg':
        return <FocusCampfireSvgPreview />;
      case 'campfire_lottie':
        return <FocusCampfireLottiePreview />;
      case 'camping_marshmallow':
        return <FocusCampingMarshmallowPreview />;
      case 'none':
      default:
        return <FocusNonePreview />;
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Live Video Backgrounds */}
      <SectionHeader title="🎥 Canlı Video Arka Planlar" />
      <View style={styles.gridContainer}>
        {videoBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => setBackgroundEffectId(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 2. Static Image Wallpapers */}
      <SectionHeader title="🖼️ Duvar Kağıtları" />
      <View style={styles.gridContainer}>
        {imageBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => setBackgroundEffectId(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 3. Particle & Ambient Effects */}
      <SectionHeader title="✨ Atmosfer & Parçacık Efektleri" />
      <View style={styles.gridContainer}>
        {otherBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => setBackgroundEffectId(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 4. Focus Animation (Work) */}
      <SectionHeader title="🐱 Çalışma Zamanı Animasyonu" />
      <View style={styles.gridContainer}>
        {focusAnimations.map((a) => (
          <AppearanceOptionCard
            key={a.id}
            title={a.label}
            subtitle={a.description}
            isSelected={workAnimationId === a.id}
            isPremium={!a.free}
            onPress={() => setWorkAnimationId(a.id)}
            renderPreview={() => renderFocusAnimationPreview(a.id)}
          />
        ))}
      </View>

      {/* 5. Focus Animation (Break) */}
      <SectionHeader title="☕ Mola Zamanı Animasyonu" />
      <View style={styles.gridContainer}>
        {focusAnimations.map((a) => (
          <AppearanceOptionCard
            key={a.id}
            title={a.label}
            subtitle={a.description}
            isSelected={breakAnimationId === a.id}
            isPremium={!a.free}
            onPress={() => setBreakAnimationId(a.id)}
            renderPreview={() => renderFocusAnimationPreview(a.id)}
          />
        ))}
      </View>

      {/* 6. Theme */}
      <SectionHeader title="🎨 Renk Temaları" />
      <View style={styles.gridContainer}>
        {availableThemes.map((t) => (
          <AppearanceOptionCard
            key={t.id}
            title={t.label}
            subtitle={t.description}
            isSelected={themeId === t.id}
            isPremium={t.isPremium}
            onPress={() => handleTheme(t.id)}
            renderPreview={() => <ThemeMockupPreview theme={t} />}
          />
        ))}
      </View>

      {/* 7. Timer Design */}
      <SectionHeader title="⏱️ Sayaç Tasarımı" />
      <View style={styles.gridContainer}>
        {timerDesigns.map((d) => (
          <AppearanceOptionCard
            key={d.id}
            title={d.label}
            subtitle={d.description}
            isSelected={timerDesignId === d.id}
            isPremium={!d.free}
            onPress={() => setTimerDesignId(d.id)}
            renderPreview={() => <TimerDesignPreview designId={d.id} />}
          />
        ))}
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
});
