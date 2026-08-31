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
import { useTranslation } from '../../../i18n';
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
  const { t } = useTranslation();
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

  const isVisualWallpaperActive =
    videoBackgrounds.some((v) => v.id === backgroundEffectId) ||
    imageBackgrounds.some((img) => img.id === backgroundEffectId);

  const handleSelectVideoOrImageBackground = (id: string) => {
    setBackgroundEffectId(id);
    // When a video or image wallpaper is selected, disable/clear focus animations
    setWorkAnimationId('none');
    setBreakAnimationId('none');
  };

  const handleSelectParticleEffect = (id: string) => {
    setBackgroundEffectId(id);
  };

  const handleSelectWorkAnimation = (id: string) => {
    if (id !== 'none' && isVisualWallpaperActive) {
      // If user chooses an animation, clear any active wallpaper so they don't clash
      setBackgroundEffectId('none');
    }
    setWorkAnimationId(id);
  };

  const handleSelectBreakAnimation = (id: string) => {
    if (id !== 'none' && isVisualWallpaperActive) {
      // If user chooses an animation, clear any active wallpaper so they don't clash
      setBackgroundEffectId('none');
    }
    setBreakAnimationId(id);
  };

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
      <SectionHeader title={t('appearance.videoBackgrounds')} />
      <View style={styles.gridContainer}>
        {videoBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => handleSelectVideoOrImageBackground(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 2. Static Image Wallpapers */}
      <SectionHeader title={t('appearance.wallpapers')} />
      <View style={styles.gridContainer}>
        {imageBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => handleSelectVideoOrImageBackground(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 3. Particle & Ambient Effects */}
      <SectionHeader title={t('appearance.atmosphereEffects')} />
      <View style={styles.gridContainer}>
        {otherBackgrounds.map((e) => (
          <AppearanceOptionCard
            key={e.id}
            title={e.label}
            subtitle={e.description}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            onPress={() => handleSelectParticleEffect(e.id)}
            renderPreview={() => renderBackgroundPreview(e.id)}
          />
        ))}
      </View>

      {/* 4. Focus Animation (Work) */}
      <SectionHeader title={t('appearance.workAnimation')} />
      <View style={styles.gridContainer}>
        {focusAnimations.map((a) => (
          <AppearanceOptionCard
            key={a.id}
            title={a.label}
            subtitle={a.description}
            isSelected={workAnimationId === a.id}
            isPremium={!a.free}
            onPress={() => handleSelectWorkAnimation(a.id)}
            renderPreview={() => renderFocusAnimationPreview(a.id)}
          />
        ))}
      </View>

      {/* 5. Focus Animation (Break) */}
      <SectionHeader title={t('appearance.breakAnimation')} />
      <View style={styles.gridContainer}>
        {focusAnimations.map((a) => (
          <AppearanceOptionCard
            key={a.id}
            title={a.label}
            subtitle={a.description}
            isSelected={breakAnimationId === a.id}
            isPremium={!a.free}
            onPress={() => handleSelectBreakAnimation(a.id)}
            renderPreview={() => renderFocusAnimationPreview(a.id)}
          />
        ))}
      </View>

      {/* 6. Theme */}
      <SectionHeader title={t('appearance.colorThemes')} />
      <View style={styles.gridContainer}>
        {availableThemes.map((tItem) => (
          <AppearanceOptionCard
            key={tItem.id}
            title={tItem.label}
            subtitle={tItem.description}
            isSelected={themeId === tItem.id}
            isPremium={tItem.isPremium}
            onPress={() => handleTheme(tItem.id)}
            renderPreview={() => <ThemeMockupPreview theme={tItem} />}
          />
        ))}
      </View>

      {/* 7. Timer Design */}
      <SectionHeader title={t('appearance.timerDesign')} />
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
