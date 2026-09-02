import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Avatar } from '../../components/Avatar';
import { BottomSheet } from '../../components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import type { FriendSummary } from '../../../state/friendsStore';
import { useTranslation, Language } from '../../../i18n';

interface FriendDetailSheetProps {
  friend: FriendSummary | null;
  visible: boolean;
  onClose: () => void;
}

function formatHours(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

export function FriendDetailSheet({ friend, visible, onClose }: FriendDetailSheetProps) {
  const colors = useColors();
  const { t, language } = useTranslation();

  if (!friend) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.avatarWrap, { borderColor: `${colors.primary}40` }]}>
            <Avatar uri={friend.avatarUrl} name={friend.displayName} size={64} />
          </View>
          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            {friend.displayName}
          </Text>
        </View>

        <View style={styles.cardsRow}>
          {/* Card 1: Toplam Süre */}
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.info}18` }]}>
              <Ionicons name="time-outline" size={20} color={colors.info} />
            </View>
            <Text
              style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xs }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {formatHours(friend.totalWorkSeconds, language)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, textAlign: 'center' }]} numberOfLines={1}>
              {t('stats.totalDuration')}
            </Text>
          </View>

          {/* Card 2: Pomodoro / Odak */}
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}18` }]}>
              <Ionicons name="disc-outline" size={20} color={colors.primary} />
            </View>
            <Text
              style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xs }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {String(friend.totalPomodoros)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, textAlign: 'center' }]} numberOfLines={1}>
              {t('stats.pomodoro')}
            </Text>
          </View>

          {/* Card 3: Streak */}
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.warning}18` }]}>
              <Ionicons name="flame" size={20} color={colors.warning} />
            </View>
            <Text
              style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xs }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {String(friend.streak)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, textAlign: 'center' }]} numberOfLines={1}>
              {t('stats.streak')}
            </Text>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

