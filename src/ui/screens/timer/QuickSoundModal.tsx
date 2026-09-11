/**
 * QuickSoundModal — High-end audio quick access sheet/modal on Timer screen.
 *
 * Provides instant control over:
 * 1. Ambient sound playing mode segmented bar:
 *    [ Kapalı | Her zaman | Sadece Molada | Sadece Çalışırken ]
 * 2. Focus & Ambient sound selection:
 *    [ Ortam Sesi Yok | Yağmur Sesi | Kamp Ateşi | Kuş Cıvıltısı ]
 *
 * Polished with glassmorphism aesthetic, subtle glowing accents,
 * haptic feedback, and real-time audio sync.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors, useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import {
  useSettingsStore,
  useTimerStore,
  AmbientSoundMode,
} from '../../../state';
import { useTranslation } from '../../../i18n';
import {
  AMBIENT_SOUNDS,
  soundService,
  SoundItem,
} from '../../../services/mobile/sound/SoundService';

interface QuickSoundModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFullSettings?: () => void;
}

interface ModeOption {
  id: AmbientSoundMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function QuickSoundModal({ visible, onClose, onOpenFullSettings }: QuickSoundModalProps) {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    ambientSoundId,
    ambientSoundMode,
    soundEnabled,
    setAmbientSoundId,
    setAmbientSoundMode,
    setSoundEnabled,
  } = useSettingsStore();

  const { isRunning, mode: timerMode } = useTimerStore();

  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Entrance spring animation using lazy useState (React 19 / Expo 57 pattern)
  const [scaleAnim] = useState(() => new Animated.Value(0.92));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleClose = () => {
    soundService.stopPreview();
    setPreviewingId(null);
    onClose();
  };

  // Clean up preview on unmount
  useEffect(() => {
    return () => {
      soundService.stopPreview();
    };
  }, []);

  // Ambient sound modes in user's exact requested order:
  // "Kapalı, Her zaman, Sadece Molada, Sadece Çalışırken"
  const modeOptions: ModeOption[] = [
    {
      id: 'off',
      label: t('soundSettings.ambientModeOff'), // 'Kapalı'
      icon: 'volume-mute-outline',
    },
    {
      id: 'always',
      label: t('soundSettings.ambientModeAlways'), // 'Her Zaman'
      icon: 'infinite-outline',
    },
    {
      id: 'break',
      label: t('soundSettings.ambientModeBreak'), // 'Sadece Molada'
      icon: 'cafe-outline',
    },
    {
      id: 'work',
      label: t('soundSettings.ambientModeWork'), // 'Sadece Çalışırken'
      icon: 'briefcase-outline',
    },
  ];

  const handleSelectMode = (newMode: AmbientSoundMode) => {
    Haptics.selectionAsync().catch(() => {});
    setAmbientSoundMode(newMode);

    // If sound was disabled globally and user picked a sound mode, auto-enable sound
    if (!soundEnabled && newMode !== 'off') {
      setSoundEnabled(true);
    }

    // Immediately sync ambient audio with current running timer
    setTimeout(() => {
      soundService.syncAmbientWithTimer(isRunning, timerMode);
    }, 50);
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

  const handleSelectSound = async (item: SoundItem) => {
    Haptics.selectionAsync().catch(() => {});
    setAmbientSoundId(item.id);

    // If user selects a sound while mode was 'off', switch mode to 'always' or 'work' for convenience
    if (item.id !== 'none' && ambientSoundMode === 'off') {
      setAmbientSoundMode('always');
    }

    if (!soundEnabled && item.id !== 'none') {
      setSoundEnabled(true);
    }

    // Immediately sync if timer is running
    setTimeout(() => {
      soundService.syncAmbientWithTimer(isRunning, timerMode);
    }, 50);

    // If timer is not running or sound wouldn't play currently, play a 2-second preview
    const isCurrentlyPlayingLive =
      isRunning &&
      item.id !== 'none' &&
      soundEnabled &&
      (ambientSoundMode === 'always' ||
        (ambientSoundMode === 'work' && timerMode === 'work') ||
        (ambientSoundMode === 'break' && (timerMode === 'shortBreak' || timerMode === 'longBreak')));

    if (!isCurrentlyPlayingLive && item.id !== 'none') {
      setPreviewingId(item.id);
      await soundService.playPreview(item.id, 2000);
      setTimeout(() => {
        setPreviewingId((cur) => (cur === item.id ? null : cur));
      }, 2000);
    } else {
      setPreviewingId(null);
      if (item.id === 'none') {
        soundService.stopPreview();
      }
    }
  };

  // The sound is actively playing if previewing OR if live in active timer session
  const isAmbientLivePlaying = (soundId: string) => {
    if (previewingId === soundId) return true;
    if (!isRunning || !soundEnabled) return false;
    if (ambientSoundId !== soundId || soundId === 'none') return false;
    if (ambientSoundMode === 'always') return true;
    if (ambientSoundMode === 'work' && timerMode === 'work') return true;
    if (ambientSoundMode === 'break' && (timerMode === 'shortBreak' || timerMode === 'longBreak')) return true;
    return false;
  };

  const getSoundIconMeta = (id: string) => {
    switch (id) {
      case 'rain':
        return {
          icon: 'rainy' as const,
          tint: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.14)',
          border: 'rgba(56, 189, 248, 0.28)',
        };
      case 'campfire':
        return {
          icon: 'bonfire' as const,
          tint: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.14)',
          border: 'rgba(245, 158, 11, 0.28)',
        };
      case 'bird':
        return {
          icon: 'leaf' as const,
          tint: '#10B981',
          bg: 'rgba(16, 185, 129, 0.14)',
          border: 'rgba(16, 185, 129, 0.28)',
        };
      default:
        return {
          icon: 'volume-mute' as const,
          tint: colors.textSecondary,
          bg: colors.surfaceVariant,
          border: colors.border,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop press to dismiss */}
        <Pressable style={styles.backdropPressable} onPress={handleClose} />

        {/* Floating Glassmorphic Dialog */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: theme.dark ? '#161923' : colors.card,
              borderColor: theme.dark ? 'rgba(255, 255, 255, 0.12)' : colors.border,
              shadowColor: colors.primary,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Subtle Ambient Light Glow at Card Top */}
          <View
            style={[
              styles.topGlowHighlight,
              { backgroundColor: colors.primary, opacity: 0.15 },
            ]}
          />

          {/* 1. Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconBadge,
                  {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: `${colors.primary}40`,
                  },
                ]}
              >
                <Ionicons name="musical-notes" size={17} color={colors.primary} />
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={[typography.bodyBold, styles.headerTitle, { color: colors.textPrimary }]}>
                  {t('timer.quickSoundTitle')}
                </Text>
                <Text
                  style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}
                  numberOfLines={1}
                >
                  {t('timer.quickSoundSubtitle')}
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              style={[
                styles.closeButton,
                { backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : colors.surfaceVariant },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* 2. Top Segmented Mode Bar: [ Kapalı | Her zaman | Sadece Molada | Sadece Çalışırken ] */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="options-outline" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[typography.overline, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
                  {t('soundSettings.ambientModeTitle')}
                </Text>
              </View>

              <View
                style={[
                  styles.segmentedBar,
                  {
                    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : colors.surfaceVariant,
                    borderColor: theme.dark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                  },
                ]}
              >
                {modeOptions.map((opt) => {
                  const isSelected = ambientSoundMode === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => handleSelectMode(opt.id)}
                      style={[
                        styles.segmentTab,
                        isSelected && [
                          styles.segmentTabActive,
                          {
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                          },
                        ],
                      ]}
                      hitSlop={4}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={13}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                        style={{ marginBottom: 2 }}
                      />
                      <Text
                        style={[
                          styles.segmentLabel,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Body: Ambient & Focus Sounds Selector */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="headset-outline" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[typography.overline, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
                  {t('soundSettings.ambientSoundTitle')}
                </Text>
              </View>

              <View style={styles.soundListContainer}>
                {AMBIENT_SOUNDS.map((s) => {
                  const isSelected = ambientSoundId === s.id;
                  const isPlaying = isAmbientLivePlaying(s.id);
                  const meta = getSoundIconMeta(s.id);

                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => handleSelectSound(s)}
                      style={[
                        styles.soundCard,
                        {
                          backgroundColor: isSelected
                            ? `${colors.primary}12`
                            : theme.dark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : colors.surface,
                          borderColor: isSelected
                            ? colors.primary
                            : theme.dark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : colors.border,
                        },
                      ]}
                    >
                      {/* Icon with Glowing Colored Circle */}
                      <View
                        style={[
                          styles.soundIconWrap,
                          {
                            backgroundColor: meta.bg,
                            borderColor: meta.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Ionicons name={meta.icon} size={18} color={meta.tint} />
                      </View>

                      {/* Text details */}
                      <View style={styles.soundInfoCol}>
                        <View style={styles.soundTitleRow}>
                          <Text
                            style={[
                              typography.bodyBold,
                              styles.soundTitle,
                              {
                                color: isSelected ? colors.primary : colors.textPrimary,
                              },
                            ]}
                          >
                            {getAmbientTitle(s.id, s.label)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
                          ]}
                          numberOfLines={1}
                        >
                          {getAmbientDesc(s.id, s.description)}
                        </Text>
                      </View>

                      {/* Right Indicator (Playing Badge or Selection Dot) */}
                      {isPlaying ? (
                        <View style={[styles.playingBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="volume-high" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                          <Text style={[typography.overline, styles.playingBadgeText]}>
                            {t('soundSettings.playingBadge')}
                          </Text>
                        </View>
                      ) : isSelected ? (
                        <View
                          style={[
                            styles.radioCircleActive,
                            {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.radioCircleInactive,
                            { borderColor: colors.textDisabled },
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. Footer Note / Full Settings Link if needed */}
            {onOpenFullSettings && (
              <Pressable
                onPress={() => {
                  handleClose();
                  onOpenFullSettings();
                }}
                style={styles.fullSettingsLink}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {t('timer.quickSoundAllSettings')}
                </Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} style={{ marginLeft: 2 }} />
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 8, 14, 0.76)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 384,
    borderRadius: 26,
    borderWidth: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    elevation: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    maxHeight: '85%',
  },
  topGlowHighlight: {
    position: 'absolute',
    top: -60,
    left: '25%',
    width: '50%',
    height: 90,
    borderRadius: 45,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
  sectionWrap: {
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
    paddingHorizontal: 2,
  },
  segmentedBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    minHeight: 52,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  segmentTabActive: {
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  segmentLabel: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  soundListContainer: {
    gap: spacing.xs + 2,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  soundIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  soundInfoCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  soundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundTitle: {
    fontSize: 14,
  },
  playingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  playingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  radioCircleActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleInactive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  fullSettingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
});
