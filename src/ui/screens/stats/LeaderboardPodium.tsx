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

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  workSeconds: number;
  pomodoros: number;
  streak: number;
  rank: number;
  isCurrentUser: boolean;
}

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  onSelectUser: (entry: LeaderboardEntry) => void;
}

function formatDuration(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

export function LeaderboardPodium({ entries, onSelectUser }: LeaderboardPodiumProps) {
  const colors = useColors();
  const { t, language } = useTranslation();

  const first = entries.find((e) => e.rank === 1);
  const second = entries.find((e) => e.rank === 2);
  const third = entries.find((e) => e.rank === 3);

  if (!first) return null;

  return (
    <View style={styles.container}>
      {/* Decorative background glow */}
      <View style={[styles.ambientGlow, { backgroundColor: `${colors.primary}12` }]} />

      <View style={styles.podiumRow}>
        {/* 2nd Place - Left */}
        {second ? (
          <Pressable
            onPress={() => onSelectUser(second)}
            style={({ pressed }) => [styles.podiumColumn, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.medalBadge, { backgroundColor: '#C0C0C0', borderColor: '#E8E8E8' }]}>
                <Ionicons name="medal" size={14} color="#333333" />
              </View>
              <View style={[styles.avatarRing, { borderColor: '#C0C0C0', borderWidth: 2.5 }]}>
                <Avatar uri={second.avatarUrl} name={second.displayName} size={50} />
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={[typography.captionBold, { color: colors.textPrimary }]} numberOfLines={1}>
                {second.displayName}
              </Text>
              {second.isCurrentUser && (
                <View style={[styles.youTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.youText}>{t('friends.you')}</Text>
                </View>
              )}
            </View>

            <Text style={[typography.overline, { color: colors.textSecondary, marginTop: 2 }]}>
              {formatDuration(second.workSeconds, language)}
            </Text>

            {/* Pedestal 2 */}
            <LinearGradient
              colors={['#7E8B9B33', '#4A556833']}
              style={[styles.pedestal, styles.pedestalSecond, { borderColor: '#A0AEC044' }]}
            >
              <Text style={[styles.rankNumber, { color: '#E2E8F0' }]}>2</Text>
              <Text style={[typography.overline, { color: '#A0AEC0', fontSize: 9 }]}>
                {second.pomodoros} 🎯
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.podiumColumn} />
        )}

        {/* 1st Place - Center Champion */}
        <Pressable
          onPress={() => onSelectUser(first)}
          style={({ pressed }) => [styles.podiumColumn, styles.firstColumn, pressed && { opacity: 0.85 }]}
        >
          {/* Crown floating above */}
          <View style={styles.crownWrapper}>
            <LinearGradient
              colors={['#FFE259', '#FFA751']}
              style={styles.crownBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trophy" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, styles.avatarRingFirst]}>
              <Avatar uri={first.avatarUrl} name={first.displayName} size={62} />
            </View>
          </View>

          <View style={styles.nameContainer}>
            <Text style={[typography.bodyBold, { color: '#FFB800', fontWeight: '800' }]} numberOfLines={1}>
              {first.displayName}
            </Text>
            {first.isCurrentUser && (
              <View style={[styles.youTag, { backgroundColor: '#FFB800' }]}>
                <Text style={[styles.youText, { color: '#000000' }]}>{t('friends.you')}</Text>
              </View>
            )}
          </View>

          <Text style={[typography.captionBold, { color: colors.textPrimary, marginTop: 2 }]}>
            {formatDuration(first.workSeconds, language)}
          </Text>

          {/* Pedestal 1 */}
          <LinearGradient
            colors={['#FFD70044', '#FFA50022']}
            style={[styles.pedestal, styles.pedestalFirst, { borderColor: '#FFD70066' }]}
          >
            <Text style={[styles.rankNumber, { color: '#FFD700', fontSize: 32 }]}>1</Text>
            <Text style={[typography.overline, { color: '#FFD700', fontSize: 10, fontWeight: '700' }]}>
              {first.pomodoros} 🎯 · {first.streak} 🔥
            </Text>
          </LinearGradient>
        </Pressable>

        {/* 3rd Place - Right */}
        {third ? (
          <Pressable
            onPress={() => onSelectUser(third)}
            style={({ pressed }) => [styles.podiumColumn, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.medalBadge, { backgroundColor: '#CD7F32', borderColor: '#E59B58' }]}>
                <Ionicons name="ribbon" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.avatarRing, { borderColor: '#CD7F32', borderWidth: 2.5 }]}>
                <Avatar uri={third.avatarUrl} name={third.displayName} size={50} />
              </View>
            </View>

            <View style={styles.nameContainer}>
              <Text style={[typography.captionBold, { color: colors.textPrimary }]} numberOfLines={1}>
                {third.displayName}
              </Text>
              {third.isCurrentUser && (
                <View style={[styles.youTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.youText}>{t('friends.you')}</Text>
                </View>
              )}
            </View>

            <Text style={[typography.overline, { color: colors.textSecondary, marginTop: 2 }]}>
              {formatDuration(third.workSeconds, language)}
            </Text>

            {/* Pedestal 3 */}
            <LinearGradient
              colors={['#CD7F3233', '#8B451322']}
              style={[styles.pedestal, styles.pedestalThird, { borderColor: '#CD7F3255' }]}
            >
              <Text style={[styles.rankNumber, { color: '#ED8936' }]}>3</Text>
              <Text style={[typography.overline, { color: '#ED8936', fontSize: 9 }]}>
                {third.pomodoros} 🎯
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.podiumColumn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    position: 'relative',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    top: 20,
    width: 220,
    height: 120,
    borderRadius: 60,
    opacity: 0.8,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    paddingTop: spacing.lg,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  firstColumn: {
    zIndex: 2,
    marginHorizontal: 4,
  },
  crownWrapper: {
    marginBottom: -8,
    zIndex: 10,
  },
  crownBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    borderRadius: 36,
    padding: 2,
  },
  avatarRingFirst: {
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  medalBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 1.5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  youTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  youText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pedestal: {
    width: '92%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  pedestalFirst: {
    height: 84,
  },
  pedestalSecond: {
    height: 64,
  },
  pedestalThird: {
    height: 52,
  },
  rankNumber: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
