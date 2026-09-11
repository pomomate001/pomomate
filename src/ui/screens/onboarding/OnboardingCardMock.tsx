import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useTranslation } from '../../../i18n';

interface OnboardingCardMockProps {
  slideIndex: number;
}

export function OnboardingCardMock({ slideIndex }: OnboardingCardMockProps) {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme.dark;
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  // SLIDE 0: Timer Screen (Start Focus & Adjust Duration)
  if (slideIndex === 0) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        {/* Mode pill selector */}
        <View style={styles.timerHeaderPills}>
          <View style={[styles.timerPillActive, { backgroundColor: colors.primary }]}>
            <Text style={[styles.pillTextActive, { color: colors.textInverse }]}>
              {t('timer.work')}
            </Text>
          </View>
          <View style={[styles.timerPillInactive, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Text style={[styles.pillTextInactive, { color: colors.textSecondary }]}>
              {t('timer.shortBreak')}
            </Text>
          </View>
          <View style={[styles.timerPillInactive, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Text style={[styles.pillTextInactive, { color: colors.textSecondary }]}>
              {t('timer.longBreak')}
            </Text>
          </View>
        </View>

        {/* Circular Timer Mockup */}
        <View style={styles.timerCircleOuter}>
          <View style={[styles.timerCircleGlow, { borderColor: `${colors.primary}33` }]}>
            <View style={[styles.timerCircleInner, { borderColor: colors.primary }]}>
              <Text style={[styles.timerDigits, { color: colors.textPrimary }]}>25:00</Text>
              <View style={[styles.tapHintBadge, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="finger-print-outline" size={14} color={colors.primary} />
                <Text style={[styles.tapHintText, { color: colors.primary }]}>
                  {t('onboarding.slide1AdjustTip')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Big Start Focus Button with Pulse Indicator */}
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            style={styles.focusButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="play" size={20} color={colors.textInverse} style={{ marginRight: 8 }} />
            <Text style={[styles.focusButtonText, { color: colors.textInverse }]}>
              {t('onboarding.slide1FocusBtn')}
            </Text>
          </LinearGradient>
          <View style={[styles.buttonPulseBeacon, { borderColor: colors.primary }]} />
        </View>
      </View>
    );
  }

  // SLIDE 1: Task Management (Pomodoro Count & Recurrence)
  if (slideIndex === 1) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <View style={styles.taskCardHeader}>
          <Text style={[typography.captionBold, { color: colors.primary, letterSpacing: 1 }]}>
            {t('tasks.title').toUpperCase()}
          </Text>
          <View style={[styles.activeTagPill, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="pricetag" size={12} color={colors.primary} />
            <Text style={[styles.tagText, { color: colors.primary }]}>
              #{t('onboarding.slide2Tag')}
            </Text>
          </View>
        </View>

        {/* Sample Task Box */}
        <View style={[styles.taskItemBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: borderCol }]}>
          <View style={styles.taskRowTop}>
            <View style={[styles.checkCircle, { borderColor: colors.primary }]}>
              <Ionicons name="checkmark" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.taskItemTitle, { color: colors.textPrimary }]}>
              {t('onboarding.slide2SampleTask')}
            </Text>
          </View>

          <View style={styles.taskBadgesRow}>
            {/* Target Pomodoros */}
            <View style={[styles.featurePill, { backgroundColor: `${colors.timerWork}22`, borderColor: `${colors.timerWork}44` }]}>
              <Text style={styles.pillEmoji}>🍅</Text>
              <Text style={[styles.featurePillText, { color: colors.textPrimary }]}>
                {t('onboarding.slide2PomodoroTarget')}
              </Text>
            </View>

            {/* Recurrence */}
            <View style={[styles.featurePill, { backgroundColor: `${colors.success}20`, borderColor: `${colors.success}44` }]}>
              <Ionicons name="repeat" size={14} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.featurePillText, { color: colors.textPrimary }]}>
                {t('onboarding.slide2RecurrenceDaily')}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Task Button Mock */}
        <View style={[styles.addTaskAction, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}50` }]}>
          <Ionicons name="add-circle" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.addTaskActionText, { color: colors.primary }]}>
            {t('tasks.addNewTask')}
          </Text>
        </View>

        <Text style={[styles.helperFootnote, { color: colors.textSecondary }]}>
          {t('onboarding.slide2HabitTip')}
        </Text>
      </View>
    );
  }

  // SLIDE 2: Buddy Focus (Invite Friends & Psychologically Inviting)
  if (slideIndex === 2) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        {/* Timer Bar with Invite Button Highlight */}
        <View style={styles.timerTopBarMock}>
          <View style={styles.timerBrandMock}>
            <Ionicons name="timer-outline" size={18} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.textPrimary, marginLeft: 6 }]}>
              PomoMate
            </Text>
          </View>

          {/* Highlighted Invite Button */}
          <View style={[styles.inviteHighlightPill, { backgroundColor: colors.primary }]}>
            <Ionicons name="person-add" size={14} color={colors.textInverse} style={{ marginRight: 4 }} />
            <Text style={[styles.inviteHighlightText, { color: colors.textInverse }]}>
              {t('onboarding.slide3InviteBtn')}
            </Text>
          </View>
        </View>

        {/* Dual Avatars Connection Visual */}
        <View style={styles.buddyConnectionContainer}>
          <View style={styles.avatarHolder}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarLetter}>S</Text>
            </View>
            <Text style={[styles.avatarName, { color: colors.textPrimary }]}>{t('common.user')}</Text>
            <View style={[styles.statusDotActive, { backgroundColor: colors.success }]} />
          </View>

          <View style={styles.syncBeamWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.accent || colors.primary]}
              style={styles.syncBeam}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={[styles.syncBadge, { backgroundColor: colors.surface, borderColor: borderCol }]}>
              <Ionicons name="flash" size={14} color={colors.primary} />
            </View>
          </View>

          <View style={styles.avatarHolder}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent || '#8E24AA' }]}>
              <Text style={styles.avatarLetter}>A</Text>
            </View>
            <Text style={[styles.avatarName, { color: colors.textPrimary }]}>{t('common.friend')}</Text>
            <View style={[styles.statusDotActive, { backgroundColor: colors.success }]} />
          </View>
        </View>

        {/* Friendly speech bubble */}
        <View style={[styles.warmSpeechBubble, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}>
          <Text style={styles.bubbleEmoji}>🤝</Text>
          <Text style={[styles.warmSpeechText, { color: colors.textPrimary }]}>
            {t('onboarding.slide3WarmNote')}
          </Text>
        </View>
      </View>
    );
  }

  // SLIDE 3: Stats, Discover, Invite & Leaderboard
  if (slideIndex === 3) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        {/* Streak & Weekly Progress Row */}
        <View style={styles.statsPreviewRow}>
          <View style={[styles.streakBadgeBox, { backgroundColor: 'rgba(255, 112, 67, 0.15)', borderColor: 'rgba(255, 112, 67, 0.35)' }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={[styles.streakNum, { color: '#FF7043' }]}>7 GÜN</Text>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>Seri Rekoru</Text>
            </View>
          </View>

          <View style={[styles.podiumPreviewBox, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <View>
              <Text style={[styles.streakNum, { color: colors.primary }]}>Liderlik</Text>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>Haftalık Lig</Text>
            </View>
          </View>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featureGrid}>
          <View style={[styles.gridItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: borderCol }]}>
            <Ionicons name="compass-outline" size={20} color={colors.primary} />
            <Text style={[styles.gridTitle, { color: colors.textPrimary }]}>Keşfet (Discover)</Text>
            <Text style={[styles.gridDesc, { color: colors.textSecondary }]}>
              {t('onboarding.slide4DiscoverHighlight')}
            </Text>
          </View>

          <View style={[styles.gridItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: borderCol }]}>
            <Ionicons name="qr-code-outline" size={20} color={colors.success} />
            <Text style={[styles.gridTitle, { color: colors.textPrimary }]}>Bağlantı & QR</Text>
            <Text style={[styles.gridDesc, { color: colors.textSecondary }]}>
              {t('onboarding.slide4InviteHighlight')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 4: Virtual Study Rooms (Fast, High-Level Overview)
  if (slideIndex === 4) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.roomMockHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.roomHeaderTop}>
            <View style={styles.liveRoomBadge}>
              <View style={styles.redLiveDot} />
              <Text style={styles.liveRoomText}>CANLI ODA</Text>
            </View>
            <View style={styles.memberCountBadge}>
              <Ionicons name="people" size={14} color="#FFF" />
              <Text style={styles.memberCountText}>12 Katılımcı</Text>
            </View>
          </View>

          <Text style={styles.roomBannerTitle}>
            {t('onboarding.slide5RoomName')}
          </Text>
          <Text style={styles.roomBannerSubtitle}>
            {t('onboarding.slide5RoomAtmosphere')}
          </Text>
        </LinearGradient>

        <View style={styles.roomBottomSection}>
          <View style={styles.roomMembersAvatars}>
            {['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800'].map((color, i) => (
              <View key={i} style={[styles.stackedAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 }]}>
                <Ionicons name="person" size={12} color="#FFF" />
              </View>
            ))}
            <Text style={[styles.moreMembersText, { color: colors.textSecondary }]}>+7 kişi</Text>
          </View>

          <View style={[styles.roomJoinPill, { backgroundColor: colors.primary }]}>
            <Text style={[styles.roomJoinText, { color: colors.textInverse }]}>Tek Dokunuşla Katıl</Text>
          </View>
        </View>

        <Text style={[styles.helperFootnote, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {t('onboarding.slide5RoomNote')}
        </Text>
      </View>
    );
  }

  // SLIDE 5: Profile Customization (Tags, Themes & Ambient Sounds)
  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
      {/* Tags preview */}
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
        {t('onboarding.slide6TagsTitle')}
      </Text>
      <View style={styles.tagsPreviewWrap}>
        {['#YKS2026', '#Yazılım', '#KPSS', '#Kitap', '#İngilizce'].map((tag, i) => (
          <View
            key={i}
            style={[
              styles.tagPillPreview,
              {
                backgroundColor: i === 0 || i === 1 ? `${colors.primary}25` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                borderColor: i === 0 || i === 1 ? colors.primary : borderCol,
              },
            ]}
          >
            <Text style={[styles.tagPillText, { color: i === 0 || i === 1 ? colors.primary : colors.textPrimary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Themes preview */}
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 8 }]}>
        {t('onboarding.slide6ThemesTitle')}
      </Text>
      <View style={styles.themesPreviewRow}>
        {['#E91E63', '#3F51B5', '#00BCD4', '#FF9800', '#00E676', '#121212'].map((color, i) => (
          <View
            key={i}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              i === 0 ? { borderWidth: 2.5, borderColor: colors.textPrimary } : {},
            ]}
          />
        ))}
      </View>

      {/* Ambient sound preview */}
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 8 }]}>
        {t('onboarding.slide6SoundsTitle')}
      </Text>
      <View style={styles.soundsPreviewRow}>
        {[
          { icon: 'rainy-outline', label: 'Yağmur' },
          { icon: 'flame-outline', label: 'Şömine' },
          { icon: 'cafe-outline', label: 'Kafe' },
          { icon: 'headset-outline', label: 'Beyaz Gürültü' },
        ].map((snd, i) => (
          <View key={i} style={[styles.soundPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: borderCol }]}>
            <Ionicons name={snd.icon as any} size={16} color={colors.primary} />
            <Text style={[styles.soundLabel, { color: colors.textPrimary }]}>{snd.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 280,
  },
  timerHeaderPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  timerPillActive: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pillTextActive: {
    fontSize: 12,
    fontWeight: '700',
  },
  timerPillInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pillTextInactive: {
    fontSize: 12,
    fontWeight: '500',
  },
  timerCircleOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  timerCircleGlow: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleInner: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  timerDigits: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tapHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: 4,
  },
  tapHintText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: spacing.md,
    position: 'relative',
    alignItems: 'center',
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.full,
    elevation: 3,
  },
  focusButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPulseBeacon: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: radius.full,
    borderWidth: 1.5,
    opacity: 0.4,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskItemBox: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  taskRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  taskBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pillEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addTaskAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTaskActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  helperFootnote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  timerTopBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  timerBrandMock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteHighlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  inviteHighlightText: {
    fontSize: 12,
    fontWeight: '700',
  },
  buddyConnectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    width: '100%',
  },
  avatarHolder: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDotActive: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  syncBeamWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 12,
  },
  syncBeam: {
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
  syncBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmSpeechBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    gap: 8,
  },
  bubbleEmoji: {
    fontSize: 20,
  },
  warmSpeechText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  statsPreviewRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: spacing.md,
  },
  streakBadgeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  podiumPreviewBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakNum: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  gridItem: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  gridDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  roomMockHeader: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  roomHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 5,
  },
  redLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveRoomText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  memberCountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  roomBannerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  roomBannerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  roomBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  roomMembersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  moreMembersText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
  roomJoinPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  roomJoinText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagsPreviewWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  tagPillPreview: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themesPreviewRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  soundsPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  soundLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
