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
import { PremiumPaywallSheet } from './PremiumPaywallSheet';
import { useTranslation } from '../../../i18n';
import {
  VideoWindmillPreview,
  VideoSkyPreview,
  VideoRainPreview,
  PixelArtPreview,
  WinterVillagePreview,
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
  const isPremium = useSettingsStore((s) => s.isPremium);
  const [showPaywall, setShowPaywall] = React.useState(false);

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

  const handleTheme = (theme: { id: string; isPremium?: boolean }) => {
    if (theme.isPremium && !isPremium) {
      setShowPaywall(true);
      return;
    }
    saveThemeId(theme.id);
    setThemeId(theme.id);
  };

  const videoBackgrounds = backgroundEffects.filter((e) => e.category === 'video');
  const imageBackgrounds = backgroundEffects.filter((e) => e.category === 'image');
  const otherBackgrounds = backgroundEffects.filter(
    (e) => e.category === 'particle' || e.category === 'none'
  );

  const isVisualWallpaperActive =
    videoBackgrounds.some((v) => v.id === backgroundEffectId) ||
    imageBackgrounds.some((img) => img.id === backgroundEffectId);

  const handleSelectVideoOrImageBackground = (item: (typeof backgroundEffects)[0]) => {
    if (!item.free && !isPremium) {
      setShowPaywall(true);
      return;
    }
    setBackgroundEffectId(item.id);
    // When a video or image wallpaper is selected, disable/clear focus animations
    setWorkAnimationId('none');
    setBreakAnimationId('none');
  };

  const handleSelectParticleEffect = (item: (typeof backgroundEffects)[0]) => {
    if (!item.free && !isPremium) {
      setShowPaywall(true);
      return;
    }
    setBackgroundEffectId(item.id);
  };

  const handleSelectWorkAnimation = (item: (typeof focusAnimations)[0]) => {
    if (!item.free && !isPremium) {
      setShowPaywall(true);
      return;
    }
    if (item.id !== 'none' && isVisualWallpaperActive) {
      // If user chooses an animation, clear any active wallpaper so they don't clash
      setBackgroundEffectId('none');
    }
    setWorkAnimationId(item.id);
  };

  const handleSelectBreakAnimation = (item: (typeof focusAnimations)[0]) => {
    if (!item.free && !isPremium) {
      setShowPaywall(true);
      return;
    }
    if (item.id !== 'none' && isVisualWallpaperActive) {
      // If user chooses an animation, clear any active wallpaper so they don't clash
      setBackgroundEffectId('none');
    }
    setBreakAnimationId(item.id);
  };

  const handleSelectTimerDesign = (item: (typeof timerDesigns)[0]) => {
    if (!item.free && !isPremium) {
      setShowPaywall(true);
      return;
    }
    setTimerDesignId(item.id);
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
      case 'image_winter_village':
        return <WinterVillagePreview />;
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

  const getEffectTitle = (id: string, fallback: string) => {
    const key = `appearanceOptions.${id === 'none' ? 'none_effect' : id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getEffectDesc = (id: string, fallback?: string) => {
    const key = `appearanceOptions.${id === 'none' ? 'none_effect' : id}.desc` as any;
    const val = t(key);
    return val !== key ? val : (fallback ?? '');
  };

  const getAnimTitle = (id: string, fallback: string) => {
    const key = `appearanceOptions.${id === 'none' ? 'none_anim' : id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getAnimDesc = (id: string, fallback?: string) => {
    const key = `appearanceOptions.${id === 'none' ? 'none_anim' : id}.desc` as any;
    const val = t(key);
    return val !== key ? val : (fallback ?? '');
  };

  const getThemeTitle = (id: string, fallback: string) => {
    const key = `appearanceOptions.theme_${id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getThemeDesc = (id: string, fallback?: string) => {
    const key = `appearanceOptions.theme_${id}.desc` as any;
    const val = t(key);
    return val !== key ? val : (fallback ?? '');
  };

  const getDesignTitle = (id: string, fallback: string) => {
    const key = `appearanceOptions.design_${id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getDesignDesc = (id: string, fallback?: string) => {
    const key = `appearanceOptions.design_${id}.desc` as any;
    const val = t(key);
    return val !== key ? val : (fallback ?? '');
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
            title={getEffectTitle(e.id, e.label)}
            subtitle={getEffectDesc(e.id, e.description)}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            isLocked={!e.free && !isPremium}
            onPress={() => handleSelectVideoOrImageBackground(e)}
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
            title={getEffectTitle(e.id, e.label)}
            subtitle={getEffectDesc(e.id, e.description)}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            isLocked={!e.free && !isPremium}
            onPress={() => handleSelectVideoOrImageBackground(e)}
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
            title={getEffectTitle(e.id, e.label)}
            subtitle={getEffectDesc(e.id, e.description)}
            isSelected={backgroundEffectId === e.id}
            isPremium={!e.free}
            isLocked={!e.free && !isPremium}
            onPress={() => handleSelectParticleEffect(e)}
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
            title={getAnimTitle(a.id, a.label)}
            subtitle={getAnimDesc(a.id, a.description)}
            isSelected={workAnimationId === a.id}
            isPremium={!a.free}
            isLocked={!a.free && !isPremium}
            onPress={() => handleSelectWorkAnimation(a)}
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
            title={getAnimTitle(a.id, a.label)}
            subtitle={getAnimDesc(a.id, a.description)}
            isSelected={breakAnimationId === a.id}
            isPremium={!a.free}
            isLocked={!a.free && !isPremium}
            onPress={() => handleSelectBreakAnimation(a)}
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
            title={getThemeTitle(tItem.id, tItem.label)}
            subtitle={getThemeDesc(tItem.id, tItem.description)}
            isSelected={themeId === tItem.id}
            isPremium={tItem.isPremium}
            isLocked={Boolean(tItem.isPremium && !isPremium)}
            onPress={() => handleTheme(tItem)}
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
            title={getDesignTitle(d.id, d.label)}
            subtitle={getDesignDesc(d.id, d.description)}
            isSelected={timerDesignId === d.id}
            isPremium={!d.free}
            isLocked={!d.free && !isPremium}
            onPress={() => handleSelectTimerDesign(d)}
            renderPreview={() => <TimerDesignPreview designId={d.id} />}
          />
        ))}
      </View>

      <View style={{ height: spacing.xxxl }} />

      <PremiumPaywallSheet
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
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
