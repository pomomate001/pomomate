import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Avatar } from '../../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../i18n';
import { LinearGradient } from 'expo-linear-gradient';

interface AchievementCardProps {
  userName: string;
  avatarUrl?: string;
  taskName?: string;
  todayPomodoros: number;
  todayDurationMinutes: number;
  streak: number;
  completedDurationMinutes: number;
}

export const AchievementCard = forwardRef<any, AchievementCardProps>(
  function AchievementCard({ userName, avatarUrl, taskName, todayPomodoros, todayDurationMinutes, streak, completedDurationMinutes }, ref) {
    const colors = useColors();
    const { t } = useTranslation();
    
    const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    };

    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circles */}
          <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: 'rgba(108, 99, 255, 0.15)' }]} />
          <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: 'rgba(255, 101, 132, 0.1)' }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.achievementEmoji}>🎯</Text>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              {t('timer.achievementTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
              {t('timer.achievementSubtitle')}
            </Text>
          </View>

          {/* Profile */}
          <View style={styles.profileSection}>
            <Avatar uri={avatarUrl} name={userName} size={56} />
            <Text style={[styles.userName, { color: '#FFFFFF' }]}>{userName}</Text>
            {taskName && (
              <View style={styles.taskBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={[styles.taskName, { color: 'rgba(255,255,255,0.8)' }]}>
                  {taskName}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(108, 99, 255, 0.2)', borderColor: 'rgba(108, 99, 255, 0.3)' }]}>
              <Ionicons name="timer-outline" size={20} color="#9D97FF" />
              <Text style={styles.statValue}>{formatDuration(completedDurationMinutes)}</Text>
              <Text style={styles.statLabel}>{t('timer.achievementSubtitle')}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: 'rgba(255, 101, 132, 0.2)', borderColor: 'rgba(255, 101, 132, 0.3)' }]}>
              <Ionicons name="flame-outline" size={20} color="#FF6584" />
              <Text style={styles.statValue}>{todayPomodoros}</Text>
              <Text style={styles.statLabel}>{t('timer.achievementTodayPomodoros')}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: 'rgba(76, 175, 80, 0.2)', borderColor: 'rgba(76, 175, 80, 0.3)' }]}>
              <Ionicons name="hourglass-outline" size={20} color="#4CAF50" />
              <Text style={styles.statValue}>{formatDuration(todayDurationMinutes)}</Text>
              <Text style={styles.statLabel}>{t('timer.achievementTodayDuration')}</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: 'rgba(33, 150, 243, 0.2)', borderColor: 'rgba(33, 150, 243, 0.3)' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#2196F3" />
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>{t('timer.achievementStreak')}</Text>
            </View>
          </View>

          {/* Branding */}
          <View style={styles.branding}>
            <Text style={styles.brandText}>🍅 PomoMate</Text>
          </View>
        </LinearGradient>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -60,
    right: -40,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  branding: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
});
