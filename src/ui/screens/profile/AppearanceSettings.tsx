/**
 * Appearance settings — theme, timer design, background effect & live video pickers.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/SectionHeader';
import { useSettingsStore } from '../../../state';
import { timerDesigns } from '../timer/timerDesigns';
import { backgroundEffects } from '../../animations/backgroundEffects';
import { focusAnimations } from '../../animations/focusAnimations';

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

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Live Video Backgrounds */}
      <SectionHeader title="🎥 Canlı Video Arka Planlar" />
      <View style={styles.optionRow}>
        {videoBackgrounds.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setBackgroundEffectId(e.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  backgroundEffectId === e.id ? colors.primary : colors.surfaceVariant,
                borderColor:
                  backgroundEffectId === e.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    backgroundEffectId === e.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {e.label}
            </Text>
            {!e.free && (
              <Ionicons
                name="star"
                size={10}
                color={colors.warning}
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Static Image Wallpapers */}
      <SectionHeader title="🖼️ Statik Arka Plan Görselleri" />
      <View style={styles.optionRow}>
        {imageBackgrounds.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setBackgroundEffectId(e.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  backgroundEffectId === e.id ? colors.primary : colors.surfaceVariant,
                borderColor:
                  backgroundEffectId === e.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    backgroundEffectId === e.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {e.label}
            </Text>
            {!e.free && (
              <Ionicons
                name="star"
                size={10}
                color={colors.warning}
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Particle & Default Effects */}
      <SectionHeader title="✨ Parçacık Efektleri & Düz" />
      <View style={styles.optionRow}>
        {otherBackgrounds.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setBackgroundEffectId(e.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  backgroundEffectId === e.id ? colors.primary : colors.surfaceVariant,
                borderColor:
                  backgroundEffectId === e.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    backgroundEffectId === e.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {e.label}
            </Text>
            {!e.free && (
              <Ionicons
                name="star"
                size={10}
                color={colors.warning}
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Work Animation */}
      <SectionHeader title="🐱 Çalışma Zamanı Animasyonu (Ortada 1x1)" />
      <View style={styles.optionRow}>
        {focusAnimations.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setWorkAnimationId(a.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  workAnimationId === a.id ? colors.primary : colors.surfaceVariant,
                borderColor: workAnimationId === a.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    workAnimationId === a.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Break Animation */}
      <SectionHeader title="☕ Mola Zamanı Animasyonu (Ortada 1x1)" />
      <View style={styles.optionRow}>
        {focusAnimations.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setBreakAnimationId(a.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  breakAnimationId === a.id ? colors.primary : colors.surfaceVariant,
                borderColor: breakAnimationId === a.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    breakAnimationId === a.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Theme */}
      <SectionHeader title="🎨 Tema" />
      <View style={styles.optionRow}>
        {availableThemes.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => handleTheme(t.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor: themeId === t.id ? colors.primary : colors.surfaceVariant,
                borderColor: themeId === t.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color: themeId === t.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timer design */}
      <SectionHeader title="⏱️ Sayaç Tasarımı" />
      <View style={styles.optionRow}>
        {timerDesigns.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => setTimerDesignId(d.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  timerDesignId === d.id ? colors.primary : colors.surfaceVariant,
                borderColor: timerDesignId === d.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    timerDesignId === d.id ? colors.textInverse : colors.textPrimary,
                },
              ]}
            >
              {d.label}
            </Text>
            {!d.free && (
              <Ionicons
                name="star"
                size={10}
                color={colors.warning}
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: spacing.lg },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
