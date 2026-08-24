/**
 * Sound settings — toggle, preview and sound selection.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/SectionHeader';
import { useSettingsStore } from '../../../state';
import { SOUND_PRESETS, soundService } from '../../../services/mobile/sound/SoundService';

export function SoundSettings() {
  const colors = useColors();
  const { soundEnabled, soundId, setSoundEnabled, setSoundId } = useSettingsStore();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleSelectSound = async (id: string) => {
    setSoundId(id);
    setPlayingId(id);

    // Play preview
    await soundService.playSound(id);

    // Reset playing state after 3 seconds
    setTimeout(() => {
      setPlayingId((current) => (current === id ? null : current));
    }, 3000);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>Ses Efektleri</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Sayaç bittiğinde ve mola başladığında ses çal
          </Text>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          trackColor={{ true: colors.primary, false: colors.surfaceVariant }}
        />
      </View>

      {/* Sound list */}
      <SectionHeader title="BİLDİRİM SESİ (DİNLEMEK İÇİN DOKUNUN)" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SOUND_PRESETS.map((s, index) => {
          const isSelected = soundId === s.id;
          const isPlaying = playingId === s.id;

          return (
            <Pressable
              key={s.id}
              onPress={() => handleSelectSound(s.id)}
              style={[
                styles.row,
                index < SOUND_PRESETS.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
                isSelected && { backgroundColor: `${colors.primary}10` },
              ]}
            >
              {/* Speaker icon */}
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isPlaying
                      ? colors.primary
                      : isSelected
                      ? `${colors.primary}20`
                      : colors.surfaceVariant,
                  },
                ]}
              >
                <Ionicons
                  name={isPlaying ? 'volume-high' : isSelected ? 'volume-medium' : 'musical-note'}
                  size={18}
                  color={isPlaying ? colors.textInverse : isSelected ? colors.primary : colors.textSecondary}
                />
              </View>

              {/* Text Info */}
              <View style={styles.infoCol}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{s.label}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{s.description}</Text>
              </View>

              {/* Checkmark or playing indicator */}
              {isPlaying ? (
                <View style={[styles.playingBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.overline, { color: colors.textInverse, fontSize: 9 }]}>ÇALIYOR</Text>
                </View>
              ) : isSelected ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color={colors.textDisabled} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: spacing.lg },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  playingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
});
