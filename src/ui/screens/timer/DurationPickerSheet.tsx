import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useSettingsStore } from '../../../state';
import { useTranslation } from '../../../i18n';
import type { TimerMode } from '../../../types';

interface DurationPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  mode: TimerMode;
}

const MODE_CONFIG: Record<TimerMode, { min: number; max: number; step: number }> = {
  work: { min: 5, max: 90, step: 5 },
  shortBreak: { min: 1, max: 15, step: 1 },
  longBreak: { min: 5, max: 60, step: 5 },
};

const ITEM_WIDTH = 24;
const TICK_SPACING = ITEM_WIDTH;

export function DurationPickerSheet({ visible, onClose, mode }: DurationPickerSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const lastSelectedRef = useRef<number>(-1);

  const {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    deepFocusEnabled,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setDeepFocusEnabled,
  } = useSettingsStore();

  const config = MODE_CONFIG[mode];
  const currentSeconds = mode === 'work' ? workDuration : mode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
  const currentMinutes = Math.round(currentSeconds / 60);

  // Generate all possible minute values
  const values = useMemo(() => {
    const arr: number[] = [];
    for (let v = config.min; v <= config.max; v += config.step) {
      arr.push(v);
    }
    return arr;
  }, [config.min, config.max, config.step]);

  const [containerWidth, setContainerWidth] = useState(0);
  const halfWidth = containerWidth / 2;

  // Scroll to current value when sheet opens
  useEffect(() => {
    if (visible && containerWidth > 0) {
      const idx = values.indexOf(currentMinutes);
      if (idx >= 0) {
        const offset = idx * TICK_SPACING;
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: offset, animated: false });
        }, 100);
      }
      lastSelectedRef.current = currentMinutes;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, containerWidth]);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / TICK_SPACING);
      const clampedIdx = Math.max(0, Math.min(idx, values.length - 1));
      const selectedMinutes = values[clampedIdx];

      if (selectedMinutes !== lastSelectedRef.current) {
        lastSelectedRef.current = selectedMinutes;
        Haptics.selectionAsync();

        const seconds = selectedMinutes * 60;
        if (mode === 'work') setWorkDuration(seconds);
        else if (mode === 'shortBreak') setShortBreakDuration(seconds);
        else setLongBreakDuration(seconds);
      }
    },
    [mode, values, setWorkDuration, setShortBreakDuration, setLongBreakDuration],
  );

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  }, []);

  const minUnit = t('timerSettings.minUnit');

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[typography.h3, styles.title, { color: colors.textPrimary }]}>
          {t('timer.durationPickerTitle')}
        </Text>

        {/* Large Duration Display */}
        <Text style={[styles.durationDisplay, { color: colors.textPrimary }]}>
          {currentMinutes} {minUnit}
        </Text>

        {/* Horizontal Ruler Picker */}
        <View
          style={styles.rulerContainer}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            onScrollEndDrag={handleScroll}
            contentContainerStyle={{
              paddingHorizontal: halfWidth - TICK_SPACING / 2,
            }}
          >
            {values.map((val, i) => {
              const isSelected = val === currentMinutes;
              const isMajor = val % (config.step * 2 === 0 ? config.step * 2 : config.step) === 0 || i === 0 || i === values.length - 1;
              return (
                <View key={val} style={[styles.tickContainer, { width: TICK_SPACING }]}>
                  <View
                    style={[
                      styles.tick,
                      isMajor ? styles.tickMajor : styles.tickMinor,
                      isSelected && { backgroundColor: colors.primary, width: 3 },
                      !isSelected && { backgroundColor: colors.textDisabled },
                    ]}
                  />
                  {(isMajor || isSelected) && (
                    <Text
                      style={[
                        styles.tickLabel,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {val}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Center indicator */}
          <View style={[styles.centerIndicator, { backgroundColor: colors.primary }]} pointerEvents="none" />
        </View>

        {/* Deep Focus Card */}
        <View style={[styles.deepFocusCard, { backgroundColor: colors.surfaceVariant ?? colors.card, borderColor: colors.border }]}>
          <View style={styles.deepFocusHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                {t('timerSettings.deepFocusTitle')}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                {t('timerSettings.deepFocusDesc')}
              </Text>
            </View>
            <Switch
              value={deepFocusEnabled}
              onValueChange={setDeepFocusEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {deepFocusEnabled && (
            <Pressable
              onPress={handleOpenSettings}
              style={styles.deepFocusGuide}
            >
              <Text style={[typography.caption, { color: colors.primary }]}>
                {t('timerSettings.openSystemSettings')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  durationDisplay: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  rulerContainer: {
    width: '100%',
    height: 70,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  tickContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tick: {
    width: 2,
    borderRadius: 1,
  },
  tickMajor: {
    height: 28,
  },
  tickMinor: {
    height: 16,
  },
  tickLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 3,
    height: 32,
    borderRadius: 2,
    marginLeft: -1.5,
  },
  deepFocusCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  deepFocusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deepFocusGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
});
