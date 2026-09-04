/**
 * Sound settings — toggle, 2s previews, completion sound selection,
 * and ambient background sound preferences.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/SectionHeader';
import { useSettingsStore, AmbientSoundMode } from '../../../state';
import { useTranslation } from '../../../i18n';
import {
  NOTIFICATION_SOUNDS,
  AMBIENT_SOUNDS,
  soundService,
  SoundItem,
} from '../../../services/mobile/sound/SoundService';

export function SoundSettings() {
  const colors = useColors();
  const { t } = useTranslation();
  const {
    soundEnabled,
    soundId,
    ambientSoundId,
    ambientSoundMode,
    setSoundEnabled,
    setSoundId,
    setAmbientSoundId,
    setAmbientSoundMode,
  } = useSettingsStore();

  const ambientModeOptions: { id: AmbientSoundMode; label: string; desc: string }[] = [
    { id: 'work', label: t('soundSettings.ambientModeWork'), desc: t('soundSettings.ambientModeWorkDesc') },
    { id: 'break', label: t('soundSettings.ambientModeBreak'), desc: t('soundSettings.ambientModeBreakDesc') },
    { id: 'always', label: t('soundSettings.ambientModeAlways'), desc: t('soundSettings.ambientModeAlwaysDesc') },
    { id: 'off', label: t('soundSettings.ambientModeOff'), desc: t('soundSettings.ambientModeOffDesc') },
  ];

  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const getNotifyTitle = (id: string, fallback: string) => {
    const key = `soundOptions.notify_${id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getNotifyDesc = (id: string, fallback: string) => {
    const key = `soundOptions.notify_${id}.desc` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };

  const getAmbientTitle = (id: string, fallback: string) => {
    const key = `soundOptions.ambient_${id}.title` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };
  const getAmbientDesc = (id: string, fallback: string) => {
    const key = `soundOptions.ambient_${id}.desc` as any;
    const val = t(key);
    return val !== key ? val : fallback;
  };

  const handleSelectCompletionSound = async (item: SoundItem) => {
    setSoundId(item.id);
    setPreviewingId(item.id);

    // Play 2-second preview
    await soundService.playPreview(item.id, 2000);

    setTimeout(() => {
      setPreviewingId((cur) => (cur === item.id ? null : cur));
    }, 2000);
  };

  const handleSelectAmbientSound = async (item: SoundItem) => {
    setAmbientSoundId(item.id);

    if (item.id !== 'none') {
      setPreviewingId(item.id);
      await soundService.playPreview(item.id, 2000);

      setTimeout(() => {
        setPreviewingId((cur) => (cur === item.id ? null : cur));
      }, 2000);
    } else {
      setPreviewingId(null);
      soundService.stopPreview();
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Master Audio Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{t('soundSettings.effectsTitle')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {t('soundSettings.effectsSubtitle')}
          </Text>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          trackColor={{ true: colors.primary, false: colors.surfaceVariant }}
        />
      </View>

      {/* ─── 1. Section: Completion Sound ─── */}
      <SectionHeader title={t('soundSettings.completionBellTitle')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {NOTIFICATION_SOUNDS.map((s, index) => {
          const isSelected = soundId === s.id;
          const isPlaying = previewingId === s.id;

          return (
            <Pressable
              key={s.id}
              onPress={() => handleSelectCompletionSound(s)}
              style={[
                styles.row,
                index < NOTIFICATION_SOUNDS.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
                isSelected && { backgroundColor: `${colors.primary}12` },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isPlaying
                      ? colors.primary
                      : isSelected
                      ? `${colors.primary}25`
                      : colors.surfaceVariant,
                  },
                ]}
              >
                <Ionicons
                  name={isPlaying ? 'volume-high' : isSelected ? 'notifications' : 'notifications-outline'}
                  size={18}
                  color={isPlaying ? '#FFF' : isSelected ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.infoCol}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{getNotifyTitle(s.id, s.label)}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{getNotifyDesc(s.id, s.description)}</Text>
              </View>

              {isPlaying ? (
                <View style={[styles.playingBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.overline, { color: '#FFF', fontSize: 9 }]}>{t('soundSettings.playingBadge')}</Text>
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

      {/* ─── 2. Section: Ambient Background Sound ─── */}
      <SectionHeader title={t('soundSettings.ambientSoundTitle')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {AMBIENT_SOUNDS.map((s, index) => {
          const isSelected = ambientSoundId === s.id;
          const isPlaying = previewingId === s.id;

          return (
            <Pressable
              key={s.id}
              onPress={() => handleSelectAmbientSound(s)}
              style={[
                styles.row,
                index < AMBIENT_SOUNDS.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
                isSelected && { backgroundColor: `${colors.primary}12` },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isPlaying
                      ? colors.primary
                      : isSelected
                      ? `${colors.primary}25`
                      : colors.surfaceVariant,
                  },
                ]}
              >
                <Ionicons
                  name={
                    s.id === 'rain'
                      ? 'rainy'
                      : s.id === 'campfire'
                      ? 'bonfire'
                      : s.id === 'bird'
                      ? 'leaf'
                      : 'volume-mute'
                  }
                  size={18}
                  color={isPlaying ? '#FFF' : isSelected ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.infoCol}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{getAmbientTitle(s.id, s.label)}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{getAmbientDesc(s.id, s.description)}</Text>
              </View>

              {isPlaying ? (
                <View style={[styles.playingBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.overline, { color: '#FFF', fontSize: 9 }]}>{t('soundSettings.playingBadge')}</Text>
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

      {/* ─── 3. Section: Ambient Sound Mode ─── */}
      <SectionHeader title={t('soundSettings.ambientModeTitle')} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ambientModeOptions.map((opt, index) => {
          const isSelected = ambientSoundMode === opt.id;

          return (
            <Pressable
              key={opt.id}
              onPress={() => setAmbientSoundMode(opt.id)}
              style={[
                styles.row,
                index < ambientModeOptions.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
                isSelected && { backgroundColor: `${colors.primary}12` },
              ]}
            >
              <View style={styles.infoCol}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{opt.label}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{opt.desc}</Text>
              </View>

              {isSelected ? (
                <Ionicons name="radio-button-on" size={22} color={colors.primary} />
              ) : (
                <Ionicons name="radio-button-off" size={22} color={colors.textDisabled} />
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
    marginBottom: spacing.lg,
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
