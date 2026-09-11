import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
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

// Local real screenshot assets (Localized TR & EN)
const SCREENSHOT_TIMER_TR = require('../../../../assets/onboarding/slide1_timer.jpg');
const SCREENSHOT_TIMER_EN = require('../../../../assets/onboarding/slide1_timer_en.jpg');
const SCREENSHOT_TASK_TR = require('../../../../assets/onboarding/slide2_task.jpg');
const SCREENSHOT_TASK_EN = require('../../../../assets/onboarding/slide2_task_en.jpg');
const SCREENSHOT_BUDDY_TR = require('../../../../assets/onboarding/slide3_buddy.jpg');
const SCREENSHOT_BUDDY_EN = require('../../../../assets/onboarding/slide3_buddy_en.jpg');
const SCREENSHOT_LEADERBOARD_TR = require('../../../../assets/onboarding/slide4_leaderboard.jpg');
const SCREENSHOT_LEADERBOARD_EN = require('../../../../assets/onboarding/slide4_leaderboard_en.jpg');

export function OnboardingCardMock({ slideIndex }: OnboardingCardMockProps) {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const { theme } = useTheme();
  const { t, language } = useTranslation();

  const isEn = language === 'en';
  const screenshotTimer = isEn ? SCREENSHOT_TIMER_EN : SCREENSHOT_TIMER_TR;
  const screenshotTask = isEn ? SCREENSHOT_TASK_EN : SCREENSHOT_TASK_TR;
  const screenshotBuddy = isEn ? SCREENSHOT_BUDDY_EN : SCREENSHOT_BUDDY_TR;
  const screenshotLeaderboard = isEn ? SCREENSHOT_LEADERBOARD_EN : SCREENSHOT_LEADERBOARD_TR;

  const bezelHeight = Math.min(380, Math.max(270, height * 0.42));
  const bezelWidth = Math.round(bezelHeight * 0.58);

  const isDark = theme.dark;
  const frameBorder = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)';
  const calloutBg = isDark ? 'rgba(15, 18, 28, 0.92)' : 'rgba(255, 255, 255, 0.95)';
  const calloutBorder = colors.primary;

  const bezelStyle = [
    styles.phoneBezel,
    { width: bezelWidth, height: bezelHeight, borderColor: frameBorder },
  ];

  // SLIDE 0: Real Timer Screen with Guided Pointers
  if (slideIndex === 0) {
    return (
      <View style={styles.mockOuter}>
        <View style={bezelStyle}>
          <Image source={screenshotTimer} style={styles.screenshotImage} resizeMode="cover" />

          {/* Semi-transparent focal overlay */}
          <View style={styles.imageOverlay} />

          {/* Pointer 1: Tap to Adjust Duration (around 25:00 digits) */}
          <View style={[styles.guidedCallout, { top: '16%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: calloutBorder }]}>
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="finger-print" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.mockAdjustTitle')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.slide1AdjustTip')}
            </Text>
            <View style={[styles.pointerArrowDown, { borderTopColor: calloutBorder }]} />
          </View>

          {/* Spotlight box over 25:00 digits */}
          <View style={[styles.spotlightRing, { top: '27%', left: '22%', width: '56%', height: '11%', borderColor: colors.primary }]} />

          {/* Pointer 2: Start Focus Button */}
          <View style={[styles.spotlightRing, { top: '61%', left: '16%', width: '68%', height: '9%', borderColor: colors.primary, borderRadius: 20 }]} />
          <View style={[styles.guidedCallout, { top: '72%', left: '10%', right: '10%', backgroundColor: calloutBg, borderColor: calloutBorder }]}>
            <View style={[styles.pointerArrowUp, { borderBottomColor: calloutBorder }]} />
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="play" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.slide1FocusBtn')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockFocusDesc')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 1: Real Task Creation Sheet with Guided Pointers
  if (slideIndex === 1) {
    return (
      <View style={styles.mockOuter}>
        <View style={bezelStyle}>
          <Image source={screenshotTask} style={styles.screenshotImage} resizeMode="cover" />

          {/* Semi-transparent focal overlay */}
          <View style={styles.imageOverlay} />

          {/* Pointer 1: Pomodoro Duration Target (1..6) */}
          <View style={[styles.spotlightRing, { top: '66%', left: '6%', width: '88%', height: '9%', borderColor: colors.primary, borderRadius: 16 }]} />
          <View style={[styles.guidedCallout, { top: '50%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: calloutBorder }]}>
            <View style={styles.calloutHeader}>
              <Text style={styles.emojiIcon}>🍅</Text>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.mockTargetTitle')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockTargetDesc')}
            </Text>
            <View style={[styles.pointerArrowDown, { borderTopColor: calloutBorder }]} />
          </View>

          {/* Pointer 2: Recurrence (Her Gün / Hafta İçi) */}
          <View style={[styles.spotlightRing, { top: '80%', left: '26%', width: '25%', height: '8%', borderColor: colors.success, borderRadius: 18 }]} />
          <View style={[styles.guidedCallout, { top: '89%', left: '10%', right: '10%', backgroundColor: calloutBg, borderColor: colors.success }]}>
            <View style={[styles.pointerArrowUp, { borderBottomColor: colors.success }]} />
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.success}25` }]}>
                <Ionicons name="repeat" size={14} color={colors.success} />
              </View>
              <Text style={[styles.calloutTitle, { color: colors.success }]}>
                {t('onboarding.mockRecurrenceTitle')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.slide2HabitTip')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 2: Real Buddy Session with Invite Button Pointer & Warm Guidance
  if (slideIndex === 2) {
    return (
      <View style={styles.mockOuter}>
        <View style={bezelStyle}>
          <Image source={screenshotBuddy} style={styles.screenshotImage} resizeMode="cover" />

          {/* Semi-transparent focal overlay */}
          <View style={styles.imageOverlay} />

          {/* Top-Right Invite Button Pointer & Spotlight */}
          <View style={[styles.spotlightRing, { top: '4%', right: '5%', width: 36, height: 36, borderRadius: 18, borderColor: '#FF4081', borderWidth: 2.5 }]} />
          
          <View style={[styles.guidedCallout, { top: '12%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: '#FF4081' }]}>
            <View style={[styles.pointerArrowUpRight, { borderBottomColor: '#FF4081' }]} />
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 64, 129, 0.2)' }]}>
                <Ionicons name="person-add" size={14} color="#FF4081" />
              </View>
              <Text style={[styles.calloutTitle, { color: '#FF4081' }]}>
                {t('onboarding.slide3InviteBtn')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockInviteDesc')}
            </Text>
          </View>

          {/* Center: Live Buddy Avatars Guidance */}
          <View style={[styles.spotlightRing, { top: '42%', left: '26%', width: '48%', height: '14%', borderColor: colors.primary, borderRadius: 24 }]} />
          
          <View style={[styles.guidedCallout, { top: '58%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: colors.primary }]}>
            <View style={[styles.pointerArrowUp, { borderBottomColor: colors.primary }]} />
            <View style={styles.calloutHeader}>
              <Text style={styles.emojiIcon}>🤝</Text>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.slide3TogetherBadge')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.slide3WarmNote')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 3: Real Leaderboard Screen (Localized EN / TR) with Guidance & Invite Callout
  if (slideIndex === 3) {
    return (
      <View style={styles.mockOuter}>
        <View style={bezelStyle}>
          <Image source={screenshotLeaderboard} style={styles.screenshotImage} resizeMode="cover" />

          {/* Semi-transparent focal overlay */}
          <View style={styles.imageOverlay} />

          {/* Pointer 1: Leaderboard & Personal Rank */}
          <View style={[styles.spotlightRing, { top: '34%', left: '6%', width: '88%', height: '15%', borderColor: '#FFD700', borderRadius: 20 }]} />
          <View style={[styles.guidedCallout, { top: '16%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: '#FFD700' }]}>
            <View style={styles.calloutHeader}>
              <Text style={styles.emojiIcon}>🏆</Text>
              <Text style={[styles.calloutTitle, { color: '#FFD700' }]}>
                {t('onboarding.mockLeaderboardTitle')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockLeaderboardDesc')}
            </Text>
            <View style={[styles.pointerArrowDown, { borderTopColor: '#FFD700' }]} />
          </View>

          {/* Pointer 2: Invite Friends to Leaderboard */}
          <View style={[styles.spotlightRing, { top: '89%', left: '6%', width: '88%', height: '7%', borderColor: colors.primary, borderRadius: 16 }]} />
          <View style={[styles.guidedCallout, { top: '74%', left: '8%', right: '8%', backgroundColor: calloutBg, borderColor: colors.primary }]}>
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="share-social" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.mockDiscoverTitle')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockDiscoverDesc')}
            </Text>
            <View style={[styles.pointerArrowDown, { borderTopColor: colors.primary }]} />
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 4: Virtual Study Rooms with Step-by-Step Navigation Guidance
  if (slideIndex === 4) {
    return (
      <View style={styles.mockOuter}>
        <View style={[...bezelStyle, { backgroundColor: isDark ? '#121018' : '#F5F5F7' }]}>
          {/* Room Screen Visual Header */}
          <LinearGradient
            colors={['#1E1B4B', '#312E81']}
            style={styles.virtualRoomCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.roomBadgeRow}>
              <View style={styles.liveIndicatorPill}>
                <View style={styles.redDot} />
                <Text style={styles.liveText}>{t('onboarding.mockLiveStudyRoom')}</Text>
              </View>
              <View style={styles.memberPill}>
                <Ionicons name="people" size={12} color="#FFF" />
                <Text style={styles.memberText}>{t('onboarding.mockMembersCount')}</Text>
              </View>
            </View>

            <Text style={styles.roomTitle}>{t('onboarding.slide5RoomName')}</Text>
            <Text style={styles.roomSubtitle}>{t('onboarding.mockRoomDesc')}</Text>

            <View style={styles.roomActionBtn}>
              <Ionicons name="log-in-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.roomActionText}>{t('onboarding.mockJoinRoom')}</Text>
            </View>
          </LinearGradient>

          {/* Step Guidance Callout */}
          <View style={[styles.guidedCalloutStatic, { backgroundColor: calloutBg, borderColor: colors.primary }]}>
            <View style={styles.calloutHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="navigate" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.calloutTitle, { color: colors.primary }]}>
                {t('onboarding.mockHowToJoin')}
              </Text>
            </View>
            <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
              {t('onboarding.mockHowToJoinDesc')}
            </Text>
          </View>

          {/* Mock Bottom Tab Bar with Arrow pointing to 'Çalışma Odası' */}
          <View style={styles.mockBottomTabBar}>
            <View style={styles.mockTabItem}>
              <Ionicons name="timer-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.timer')}</Text>
            </View>
            <View style={styles.mockTabItem}>
              <Ionicons name="stats-chart-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.stats')}</Text>
            </View>
            <View style={[styles.mockTabItemActive, { borderColor: colors.primary }]}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={[styles.mockTabLabel, { color: colors.primary, fontWeight: '700' }]}>{t('tabs.room')}</Text>
              {/* Pointing arrow */}
              <View style={[styles.pointerArrowUp, { borderBottomColor: colors.primary, top: -10 }]} />
            </View>
            <View style={styles.mockTabItem}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.profile')}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // SLIDE 5: Profile Customization (Tags, Themes & Sounds) with Navigation Pointer
  return (
    <View style={styles.mockOuter}>
      <View style={[...bezelStyle, { backgroundColor: isDark ? '#121018' : '#F5F5F7' }]}>
        {/* Customization items mock */}
        <View style={styles.profileSectionWrap}>
          {/* Tags */}
          <View style={[styles.profileSettingCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFF', borderColor: frameBorder }]}>
            <View style={styles.settingCardHeader}>
              <Ionicons name="pricetags-outline" size={16} color={colors.primary} />
              <Text style={[styles.settingCardTitle, { color: colors.textPrimary }]}>
                {t('onboarding.mockTagsTitle')}
              </Text>
            </View>
            <View style={styles.tagChipsRow}>
              <View style={[styles.tagChipActive, { backgroundColor: `${colors.primary}25`, borderColor: colors.primary }]}>
                <Text style={[styles.tagChipText, { color: colors.primary }]}>#YKS2026</Text>
              </View>
              <View style={[styles.tagChipActive, { backgroundColor: `${colors.primary}25`, borderColor: colors.primary }]}>
                <Text style={[styles.tagChipText, { color: colors.primary }]}>#Yazılım</Text>
              </View>
              <View style={[styles.tagChipInactive, { borderColor: frameBorder }]}>
                <Text style={[styles.tagChipText, { color: colors.textSecondary }]}>#Kitap</Text>
              </View>
            </View>
          </View>

          {/* Theme & Sound */}
          <View style={[styles.profileSettingCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFF', borderColor: frameBorder }]}>
            <View style={styles.settingCardHeader}>
              <Ionicons name="color-palette-outline" size={16} color={colors.primary} />
              <Text style={[styles.settingCardTitle, { color: colors.textPrimary }]}>
                {t('onboarding.mockThemesSoundsTitle')}
              </Text>
            </View>
            <View style={styles.swatchesAndSounds}>
              <View style={styles.swatchesRow}>
                {['#E91E63', '#3F51B5', '#00BCD4', '#00E676'].map((col, i) => (
                  <View key={i} style={[styles.colorDot, { backgroundColor: col }, i === 0 && { borderWidth: 2, borderColor: colors.textPrimary }]} />
                ))}
              </View>
              <View style={styles.soundsRow}>
                <Text style={[styles.soundBadgeText, { color: colors.textSecondary }]}>
                  {t('onboarding.mockSoundsText')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Guidance Callout */}
        <View style={[styles.guidedCalloutStatic, { backgroundColor: calloutBg, borderColor: colors.primary }]}>
          <View style={styles.calloutHeader}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}25` }]}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.calloutTitle, { color: colors.primary }]}>
              {t('onboarding.mockManageFromProfile')}
            </Text>
          </View>
          <Text style={[styles.calloutDesc, { color: colors.textPrimary }]}>
            {t('onboarding.mockManageFromProfileDesc')}
          </Text>
        </View>

        {/* Mock Bottom Tab Bar with Arrow pointing to 'Profil' */}
        <View style={styles.mockBottomTabBar}>
          <View style={styles.mockTabItem}>
            <Ionicons name="timer-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.timer')}</Text>
          </View>
          <View style={styles.mockTabItem}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.stats')}</Text>
          </View>
          <View style={styles.mockTabItem}>
            <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.mockTabLabel, { color: colors.textSecondary }]}>{t('tabs.room')}</Text>
          </View>
          <View style={[styles.mockTabItemActive, { borderColor: colors.primary }]}>
            <Ionicons name="person" size={18} color={colors.primary} />
            <Text style={[styles.mockTabLabel, { color: colors.primary, fontWeight: '700' }]}>{t('tabs.profile')}</Text>
            {/* Pointing arrow */}
            <View style={[styles.pointerArrowUp, { borderBottomColor: colors.primary, top: -10 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mockOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phoneBezel: {
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F0C10',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  spotlightRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  guidedCallout: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  guidedCalloutStatic: {
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 10,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 14,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  calloutDesc: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  pointerArrowDown: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerArrowUp: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerArrowUpRight: {
    position: 'absolute',
    top: -8,
    right: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  virtualRoomCard: {
    margin: 10,
    borderRadius: 18,
    padding: 12,
  },
  roomBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 4,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 8,
    fontWeight: '800',
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  memberText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
  roomTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  roomSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 14,
  },
  roomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  roomActionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mockBottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(15, 18, 28, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 4,
  },
  mockTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockTabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mockTabLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  profileSectionWrap: {
    padding: 10,
    gap: 8,
  },
  profileSettingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
  },
  settingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  settingCardTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagChipActive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagChipInactive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  swatchesAndSounds: {
    gap: 4,
  },
  swatchesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  soundsRow: {
    marginTop: 2,
  },
  soundBadgeText: {
    fontSize: 9,
    fontWeight: '500',
  },
});
