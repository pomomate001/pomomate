/**
 * Sound settings — toggle and sound selection.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/SectionHeader';
import { useSettingsStore } from '../../../state';

/** Sound registry — extensible. */
const sounds = [
  { id: 'default', label: 'Varsayılan' },
  { id: 'bell', label: 'Çan' },
  { id: 'chime', label: 'Melodi' },
  { id: 'bird', label: 'Kuş Sesi' },
];

export function SoundSettings() {
  const colors = useColors();
  const { soundEnabled, soundId, setSoundEnabled, setSoundId } = useSettingsStore();

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.card }]}>
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>Ses Efektleri</Text>
        <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: colors.primary }} />
      </View>

      {/* Sound list */}
      <SectionHeader title="Bildirim Sesi" />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {sounds.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSoundId(s.id)}
            style={[styles.row, { borderBottomColor: colors.divider }]}
          >
            <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{s.label}</Text>
            {soundId === s.id && (
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  card: { marginHorizontal: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
