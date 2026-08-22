/**
 * Appearance settings — theme, timer design, background effect pickers.
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

export function AppearanceSettings() {
  const colors = useColors();
  const { availableThemes, setThemeId } = useTheme();
  const {
    themeId, timerDesignId, backgroundEffectId,
    setThemeId: saveThemeId, setTimerDesignId, setBackgroundEffectId,
  } = useSettingsStore();

  const handleTheme = (id: string) => {
    saveThemeId(id);
    setThemeId(id);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Theme */}
      <SectionHeader title="Tema" />
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
            <Text style={[typography.captionBold, { color: themeId === t.id ? colors.textInverse : colors.textPrimary }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timer design */}
      <SectionHeader title="Sayaç Tasarımı" />
      <View style={styles.optionRow}>
        {timerDesigns.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => setTimerDesignId(d.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor: timerDesignId === d.id ? colors.primary : colors.surfaceVariant,
                borderColor: timerDesignId === d.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[typography.captionBold, { color: timerDesignId === d.id ? colors.textInverse : colors.textPrimary }]}>
              {d.label}
            </Text>
            {!d.free && (
              <Ionicons name="star" size={10} color={colors.warning} style={{ marginLeft: 4 }} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Background effect */}
      <SectionHeader title="Arka Plan Efekti" />
      <View style={styles.optionRow}>
        {backgroundEffects.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setBackgroundEffectId(e.id)}
            style={[
              styles.optionChip,
              {
                backgroundColor: backgroundEffectId === e.id ? colors.primary : colors.surfaceVariant,
                borderColor: backgroundEffectId === e.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[typography.captionBold, { color: backgroundEffectId === e.id ? colors.textInverse : colors.textPrimary }]}>
              {e.label}
            </Text>
            {!e.free && (
              <Ionicons name="star" size={10} color={colors.warning} style={{ marginLeft: 4 }} />
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
