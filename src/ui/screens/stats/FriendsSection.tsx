import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useFriendsStore, useUserStore } from '../../../state';
import { Button } from '../../components/Button';
import { LeaderboardPodium, LeaderboardEntry } from './LeaderboardPodium';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardShareModal } from './LeaderboardShareModal';
import { FriendDetailSheet } from './FriendDetailSheet';
import { AddFriendSheet } from './AddFriendSheet';
import { friendService } from '../../../services/friends/FriendService';
import type { FriendSummary } from '../../../state/friendsStore';
import { useTranslation, Language } from '../../../i18n';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatsStackParamList } from '../../../navigation/types';

export interface FriendsSectionProps {
  period?: 'daily' | 'weekly' | 'monthly';
  userPeriodStats?: {
    workSeconds: number;
    pomodoros: number;
    streak: number;
  };
}

function formatHours(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

export function FriendsSection({ period = 'daily', userPeriodStats }: FriendsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FriendSummary | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { t, language } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();

  const friends = useFriendsStore((s) => s.friends);
  const incomingRequests = useFriendsStore((s) => s.incomingRequests);
  const user = useUserStore((s) => s.user);
  const colors = useColors();

  // Re-fetch friend stats whenever the user or period changes
  useEffect(() => {
    if (user?.id) {
      friendService.fetchFriends(user.id, period);
    }
  }, [user?.id, period]);

  // Build full leaderboard list containing current user + friends, ranked by score
  const leaderboardEntries = useMemo(() => {
    const userEntry: LeaderboardEntry = {
      userId: user?.id || 'current-user',
      displayName: user?.displayName || t('profile.userDefault') || 'Sen',
      avatarUrl: user?.avatarUrl ?? undefined,
      workSeconds: userPeriodStats?.workSeconds ?? 0,
      pomodoros: userPeriodStats?.pomodoros ?? 0,
      streak: userPeriodStats?.streak ?? 0,
      rank: 1,
      isCurrentUser: true,
    };

    const friendEntries: LeaderboardEntry[] = friends.map((f) => {
      const pStat = f.currentPeriodStats || (period && f.periodStats?.[period]) || {
        workSeconds: f.totalWorkSeconds,
        pomodoros: f.totalPomodoros,
        streak: f.streak,
      };

      return {
        userId: f.userId,
        displayName: f.displayName,
        avatarUrl: f.avatarUrl,
        workSeconds: pStat.workSeconds,
        pomodoros: pStat.pomodoros,
        streak: pStat.streak,
        rank: 1,
        isCurrentUser: false,
      };
    });

    const all = [userEntry, ...friendEntries];
    all.sort((a, b) => {
      if (b.workSeconds !== a.workSeconds) return b.workSeconds - a.workSeconds;
      if (b.pomodoros !== a.pomodoros) return b.pomodoros - a.pomodoros;
      if (b.streak !== a.streak) return b.streak - a.streak;
      return a.displayName.localeCompare(b.displayName);
    });

    return all.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [user, userPeriodStats, friends, period, t]);

  const currentUserEntry = useMemo(
    () => leaderboardEntries.find((e) => e.isCurrentUser),
    [leaderboardEntries]
  );

  const periodLabel = useMemo(() => {
    if (period === 'daily') return t('friends.dailyRanking');
    if (period === 'weekly') return t('friends.weeklyRanking');
    return t('friends.monthlyRanking');
  }, [period, t]);

  const handleSelectEntry = (entry: LeaderboardEntry) => {
    if (entry.isCurrentUser) return;
    const found = friends.find((f) => f.userId === entry.userId) ?? null;
    setSelectedFriend(found);
  };

  return (
    <View style={styles.container}>
      {/* Main Leaderboard Header */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[
          styles.header,
          {
            borderColor: colors.divider,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {/* Trophy Icon with glowing aura */}
          <LinearGradient
            colors={['#FFE259', '#FFA751']}
            style={styles.trophyBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trophy" size={18} color="#FFFFFF" />
          </LinearGradient>

          <View style={{ marginLeft: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>
                {t('friends.leaderboardTitle')}
              </Text>
              <View style={[styles.periodBadge, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[styles.periodBadgeText, { color: colors.primary }]}>
                  {period === 'daily'
                    ? t('stats.daily')
                    : period === 'weekly'
                    ? t('stats.weekly')
                    : t('stats.monthly')}
                </Text>
              </View>
            </View>

            {/* Collapsed state quick preview */}
            {!expanded && currentUserEntry && (
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {t('friends.yourRankInfo', { rank: currentUserEntry.rank })} ·{' '}
                {formatHours(currentUserEntry.workSeconds, language)}
              </Text>
            )}
          </View>
        </View>

        {/* Header Action Buttons */}
        <View style={styles.headerRight}>
          {/* Share Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setShowShareModal(true);
            }}
            hitSlop={8}
            style={[styles.actionIconBtn, { backgroundColor: `${colors.primary}18` }]}
            accessibilityLabel={t('friends.shareRanking')}
          >
            <Ionicons name="share-social" size={17} color={colors.primary} />
          </Pressable>

          {/* Discover Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Discover');
            }}
            hitSlop={8}
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceVariant }]}
          >
            <Ionicons name="search" size={16} color={colors.textPrimary} />
          </Pressable>

          {/* Add Friend Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setShowAddFriend(true);
            }}
            hitSlop={8}
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceVariant, position: 'relative' }]}
          >
            <Ionicons name="person-add" size={16} color={colors.textPrimary} />
            {incomingRequests.length > 0 && (
              <View style={[styles.reqBadge, { backgroundColor: colors.error }]}>
                <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>
                  {incomingRequests.length}
                </Text>
              </View>
            )}
          </Pressable>

          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.textSecondary}
            style={{ marginLeft: 2 }}
          />
        </View>
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <View style={[styles.expandedContent, { backgroundColor: colors.surface }]}>
          {/* Top 3 Podium (Shown when at least 2 entries exist) */}
          {leaderboardEntries.length >= 2 ? (
            <>
              <LeaderboardPodium
                entries={leaderboardEntries}
                onSelectUser={handleSelectEntry}
              />

              {/* Divider between Podium and List */}
              <View style={[styles.listDivider, { backgroundColor: colors.divider }]} />

              {/* Full Ranked List */}
              <View style={styles.listContainer}>
                {leaderboardEntries.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    onPress={handleSelectEntry}
                  />
                ))}
              </View>
            </>
          ) : (
            /* User only - no friends yet */
            <View style={styles.singleUserWrap}>
              <View style={styles.soloHeroCard}>
                <LinearGradient
                  colors={['#FFE25922', '#FFA75111']}
                  style={styles.soloGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="trophy" size={36} color="#FFB800" style={{ marginBottom: 6 }} />
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, textAlign: 'center' }]}>
                    {t('friends.emptyLeaderboardMsg')}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 14 },
                    ]}
                  >
                    {t('friends.inviteFriendsToCompete')}
                  </Text>

                  <Button
                    title={t('friends.addFriend')}
                    variant="primary"
                    size="sm"
                    onPress={() => setShowAddFriend(true)}
                  />
                </LinearGradient>
              </View>

              {/* Show the user's row */}
              {currentUserEntry && (
                <View style={{ marginTop: spacing.sm, width: '100%' }}>
                  <LeaderboardRow entry={currentUserEntry} onPress={() => {}} />
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Friend Detail Sheet */}
      <FriendDetailSheet
        friend={selectedFriend}
        visible={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
        period={period}
      />

      {/* Add Friend Sheet */}
      <AddFriendSheet
        visible={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />

      {/* Leaderboard Share Modal */}
      <LeaderboardShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        entries={leaderboardEntries}
        currentUserEntry={currentUserEntry}
        periodLabel={periodLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trophyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  periodBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  periodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  expandedContent: {
    paddingBottom: spacing.md,
  },
  listDivider: {
    height: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.xs,
  },
  singleUserWrap: {
    padding: spacing.md,
    alignItems: 'center',
  },
  soloHeroCard: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  soloGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FFD70044',
  },
});
