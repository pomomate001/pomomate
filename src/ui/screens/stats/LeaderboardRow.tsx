import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Avatar } from '../../components/Avatar';
import { useTranslation, Language } from '../../../i18n';
import type { LeaderboardEntry } from './LeaderboardPodium';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  onPress: (entry: LeaderboardEntry) => void;
}

function formatDuration(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

export function LeaderboardRow({ entry, onPress }: LeaderboardRowProps) {
  const colors = useColors();
  const { t, language } = useTranslation();

  const isTopThree = entry.rank <= 3;

  const getRankBadge = () => {
    if (entry.rank === 1) {
      return (
        <LinearGradient
          colors={['#FFE259', '#FFA751']}
          style={styles.rankBadgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="trophy" size={13} color="#FFFFFF" />
        </LinearGradient>
      );
    }
    if (entry.rank === 2) {
      return (
        <LinearGradient
          colors={['#E0E0E0', '#A8A8A8']}
          style={styles.rankBadgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="medal" size={13} color="#FFFFFF" />
        </LinearGradient>
      );
    }
    if (entry.rank === 3) {
      return (
        <LinearGradient
          colors={['#E59B58', '#CD7F32']}
          style={styles.rankBadgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="ribbon" size={13} color="#FFFFFF" />
        </LinearGradient>
      );
    }
    return (
      <View style={[styles.normalRankBadge, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, fontSize: 12 }]}>
          #{entry.rank}
        </Text>
      </View>
    );
  };

  const getAvatarBorder = () => {
    if (entry.rank === 1) return '#FFD700';
    if (entry.rank === 2) return '#C0C0C0';
    if (entry.rank === 3) return '#CD7F32';
    if (entry.isCurrentUser) return colors.primary;
    return 'transparent';
  };

  return (
    <Pressable
      onPress={() => onPress(entry)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: entry.isCurrentUser ? `${colors.primary}10` : 'transparent',
          borderColor: entry.isCurrentUser ? `${colors.primary}44` : colors.divider,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      {/* Rank badge */}
      <View style={styles.rankWrap}>{getRankBadge()}</View>

      {/* Avatar */}
      <View style={[styles.avatarContainer, { borderColor: getAvatarBorder() }]}>
        <Avatar uri={entry.avatarUrl} name={entry.displayName} size={40} />
      </View>

      {/* Info: Name & Subtitle */}
      <View style={styles.infoWrap}>
        <View style={styles.nameRow}>
          <Text
            style={[
              typography.bodyBold,
              { color: entry.isCurrentUser ? colors.primary : colors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {entry.displayName}
          </Text>
          {entry.isCurrentUser && (
            <View style={[styles.youPill, { backgroundColor: colors.primary }]}>
              <Text style={styles.youText}>{t('friends.you')}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsSubtitleRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            🎯 {entry.pomodoros} {t('stats.pomoUnit') || 'Pomo'}
          </Text>
          {entry.streak > 0 && (
            <Text style={[typography.caption, { color: colors.warning, marginLeft: 8 }]}>
              🔥 {entry.streak}
            </Text>
          )}
        </View>
      </View>

      {/* Time score on right */}
      <View style={styles.scoreWrap}>
        <Text
          style={[
            typography.bodyBold,
            {
              color: isTopThree ? (entry.rank === 1 ? '#FFB800' : colors.textPrimary) : colors.textPrimary,
              fontSize: 15,
            },
          ]}
        >
          {formatDuration(entry.workSeconds, language)}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textDisabled} style={{ marginTop: 2 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderRadius: radius.md,
    marginHorizontal: spacing.xs,
    marginVertical: 1,
  },
  rankWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeGradient: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  normalRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    marginHorizontal: spacing.sm,
    borderRadius: 22,
    padding: 1,
    borderWidth: 2,
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  youPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.full,
  },
  youText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statsSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scoreWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
