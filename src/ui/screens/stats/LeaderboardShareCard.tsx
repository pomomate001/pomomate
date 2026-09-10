import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/Avatar';
import { useTranslation, Language } from '../../../i18n';
import type { LeaderboardEntry } from './LeaderboardPodium';

interface LeaderboardShareCardProps {
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  periodLabel: string;
}

function formatDuration(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

export const LeaderboardShareCard = forwardRef<any, LeaderboardShareCardProps>(
  function LeaderboardShareCard({ entries, currentUserEntry, periodLabel }, ref) {
    const { t, language } = useTranslation();

    const topEntries = entries.slice(0, 5);

    const getRankIcon = (rank: number) => {
      if (rank === 1) return { icon: 'trophy' as const, color: '#FFD700', bg: ['#FFE259', '#FFA751'] };
      if (rank === 2) return { icon: 'medal' as const, color: '#E0E0E0', bg: ['#E0E0E0', '#A8A8A8'] };
      if (rank === 3) return { icon: 'ribbon' as const, color: '#CD7F32', bg: ['#E59B58', '#CD7F32'] };
      return { icon: 'star' as const, color: '#8E9AAF', bg: ['#2A2E3D', '#1F2432'] };
    };

    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <LinearGradient
          colors={['#0c101d', '#13192f', '#090d18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative ambient glowing orbs */}
          <View style={[styles.glowOrb, styles.glowOrb1]} />
          <View style={[styles.glowOrb, styles.glowOrb2]} />
          <View style={[styles.glowOrb, styles.glowOrb3]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandingTop}>
              <Image source={require('../../../../assets/brand-logo.png')} style={styles.brandLogo} />
              <Text style={styles.brandTitle}>PomoMate</Text>
            </View>

            <View style={styles.trophyRing}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
            </View>

            <Text style={styles.mainTitle}>{t('friends.leaderboardTitle').toUpperCase()}</Text>
            
            <View style={styles.periodPill}>
              <Ionicons name="calendar-outline" size={13} color="#FFD700" />
              <Text style={styles.periodText}>{periodLabel}</Text>
            </View>
          </View>

          {/* User's Own Achievement Box (Hero Callout) */}
          {currentUserEntry && (
            <LinearGradient
              colors={['#6C63FF33', '#3F3D5644']}
              style={styles.userCallout}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.calloutAvatar}>
                <Avatar uri={currentUserEntry.avatarUrl} name={currentUserEntry.displayName} size={52} />
                <View style={styles.calloutRankBadge}>
                  <Text style={styles.calloutRankText}>#{currentUserEntry.rank}</Text>
                </View>
              </View>

              <View style={styles.calloutDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.calloutName} numberOfLines={1}>
                    {currentUserEntry.displayName}
                  </Text>
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>{t('friends.you')}</Text>
                  </View>
                </View>

                <View style={styles.calloutStats}>
                  <View style={styles.statChip}>
                    <Ionicons name="time-outline" size={13} color="#9D97FF" />
                    <Text style={styles.statChipText}>
                      {formatDuration(currentUserEntry.workSeconds, language)}
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Ionicons name="disc-outline" size={13} color="#FF6584" />
                    <Text style={styles.statChipText}>
                      {currentUserEntry.pomodoros} {t('stats.pomoUnit') || 'Pomo'}
                    </Text>
                  </View>
                  {currentUserEntry.streak > 0 && (
                    <View style={styles.statChip}>
                      <Ionicons name="flame" size={13} color="#FF9F43" />
                      <Text style={styles.statChipText}>{currentUserEntry.streak}</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Rankings List */}
          <View style={styles.rankingsContainer}>
            <Text style={styles.rankingSectionTitle}>
              👑 {t('friends.podiumTitle') || 'Ödül Kürsüsü & Sıralama'}
            </Text>

            {topEntries.map((item) => {
              const badgeInfo = getRankIcon(item.rank);
              const isFirst = item.rank === 1;

              return (
                <View
                  key={item.userId}
                  style={[
                    styles.rankRow,
                    item.isCurrentUser && styles.rankRowHighlight,
                    isFirst && styles.rankRowFirst,
                  ]}
                >
                  <LinearGradient
                    colors={badgeInfo.bg as any}
                    style={styles.rankBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={badgeInfo.icon} size={12} color="#FFFFFF" />
                  </LinearGradient>

                  <Avatar uri={item.avatarUrl} name={item.displayName} size={34} />

                  <View style={styles.rankInfo}>
                    <Text
                      style={[
                        styles.rankName,
                        item.isCurrentUser && { color: '#9D97FF', fontWeight: '800' },
                        isFirst && { color: '#FFD700', fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.displayName}
                    </Text>
                    <Text style={styles.rankPomoText}>
                      🎯 {item.pomodoros} {t('stats.pomoUnit') || 'Pomo'}
                    </Text>
                  </View>

                  <View style={styles.rankDurationWrap}>
                    <Text
                      style={[
                        styles.rankDuration,
                        isFirst && { color: '#FFD700' },
                      ]}
                    >
                      {formatDuration(item.workSeconds, language)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Footer Branding */}
          <View style={styles.footer}>
            <Text style={styles.footerTagline}>
              🎯 {t('friends.inviteFriendsToCompete') || 'PomoMate ile birlikte odaklan, birlikte başar!'}
            </Text>
          </View>
        </LinearGradient>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    top: -50,
    right: -40,
  },
  glowOrb2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    bottom: 40,
    left: -60,
  },
  glowOrb3: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 101, 132, 0.12)',
    top: '40%',
    right: -30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  brandLogo: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  brandTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  trophyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    marginBottom: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  periodText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  userCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.4)',
    marginBottom: 18,
  },
  calloutAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  calloutRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  calloutRankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  calloutDetails: {
    flex: 1,
  },
  calloutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  youBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  calloutStats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statChipText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  rankingsContainer: {
    gap: 8,
  },
  rankingSectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rankRowHighlight: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderColor: 'rgba(108, 99, 255, 0.35)',
  },
  rankRowFirst: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rankName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  rankPomoText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10,
    marginTop: 1,
  },
  rankDurationWrap: {
    alignItems: 'flex-end',
  },
  rankDuration: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerTagline: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
