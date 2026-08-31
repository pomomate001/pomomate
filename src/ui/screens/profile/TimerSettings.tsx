/**
 * Timer duration settings — work/short break/long break durations.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/SectionHeader';
import { IconButton } from '../../components/IconButton';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../../state';
import { useTranslation } from '../../../i18n';

function DurationRow({
  label,
  seconds,
  minUnit,
  onIncrease,
  onDecrease,
}: {
  label: string;
  seconds: number;
  minUnit: string;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const colors = useColors();
  const minutes = Math.round(seconds / 60);

  return (
    <View style={[styles.durationRow, { borderBottomColor: colors.divider }]}>
      <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{label}</Text>
      <IconButton
        icon={<Ionicons name="remove" size={18} color={colors.textPrimary} />}
        onPress={onDecrease}
        size={32}
      />
      <Text style={[typography.h3, { color: colors.primary, width: 60, textAlign: 'center' }]}>
        {minutes}{minUnit}
      </Text>
      <IconButton
        icon={<Ionicons name="add" size={18} color={colors.textPrimary} />}
        onPress={onIncrease}
        size={32}
      />
    </View>
  );
}

export function TimerSettings() {
  const colors = useColors();
  const { t } = useTranslation();
  const {
    workDuration, shortBreakDuration, longBreakDuration, cyclesBeforeLongBreak,
    setWorkDuration, setShortBreakDuration, setLongBreakDuration, setCyclesBeforeLongBreak,
  } = useSettingsStore();

  const step = 60; // 1 minute
  const minUnit = t('timerSettings.minUnit');

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionHeader title={t('timerSettings.title')} />

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <DurationRow
          label={t('timerSettings.work')}
          seconds={workDuration}
          minUnit={minUnit}
          onIncrease={() => setWorkDuration(Math.min(workDuration + step * 5, 90 * 60))}
          onDecrease={() => setWorkDuration(Math.max(workDuration - step * 5, 5 * 60))}
        />
        <DurationRow
          label={t('timerSettings.shortBreak')}
          seconds={shortBreakDuration}
          minUnit={minUnit}
          onIncrease={() => setShortBreakDuration(Math.min(shortBreakDuration + step, 15 * 60))}
          onDecrease={() => setShortBreakDuration(Math.max(shortBreakDuration - step, 60))}
        />
        <DurationRow
          label={t('timerSettings.longBreak')}
          seconds={longBreakDuration}
          minUnit={minUnit}
          onIncrease={() => setLongBreakDuration(Math.min(longBreakDuration + step * 5, 60 * 60))}
          onDecrease={() => setLongBreakDuration(Math.max(longBreakDuration - step * 5, 5 * 60))}
        />
        <DurationRow
          label={t('timerSettings.cyclesBeforeLongBreak')}
          seconds={cyclesBeforeLongBreak * 60}
          minUnit=""
          onIncrease={() => setCyclesBeforeLongBreak(Math.min(cyclesBeforeLongBreak + 1, 10))}
          onDecrease={() => setCyclesBeforeLongBreak(Math.max(cyclesBeforeLongBreak - 1, 2))}
        />
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: spacing.lg },
  card: { marginHorizontal: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
});
