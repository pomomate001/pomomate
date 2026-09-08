import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
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
  buddyName?: string;
  buddyAvatarUrl?: string;
}

export const AchievementCard = forwardRef<any, AchievementCardProps>(
  function AchievementCard({ userName, avatarUrl, taskName, todayPomodoros, todayDurationMinutes, streak, completedDurationMinutes, buddyName, buddyAvatarUrl }, ref) {
    const { t } = useTranslation();
    
    const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h > 0) return `${h}s ${m}d`;
      return `${m} dk`;
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
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
            </View>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              {t('timer.achievementTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
              {t('timer.achievementSubtitle')}
            </Text>
          </View>

          {/* Profile */}
          <View style={styles.profileSection}>
            {buddyName ? (
              <View style={styles.buddyContainer}>
                <View style={styles.avatarWrapper}>
                  <Avatar uri={avatarUrl} name={userName} size={50} />
                  <Text style={[styles.userName, { color: '#FFFFFF', fontSize: 12 }]} numberOfLines={1}>{userName.split(' ')[0]}</Text>
                </View>
                <View style={styles.buddyLinkIcon}>
                  <Ionicons name="link" size={16} color="rgba(255,255,255,0.6)" />
                </View>
                <View style={styles.avatarWrapper}>
                  <Avatar uri={buddyAvatarUrl} name={buddyName} size={50} />
                  <Text style={[styles.userName, { color: '#FFFFFF', fontSize: 12 }]} numberOfLines={1}>{buddyName.split(' ')[0]}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.avatarWrapper}>
                <Avatar uri={avatarUrl} name={userName} size={56} />
                <Text style={[styles.userName, { color: '#FFFFFF' }]}>{userName}</Text>
              </View>
            )}
            
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
            <Image source={require('../../../../assets/brand-logo.png')} style={styles.brandLogo} />
            <Text style={styles.brandText}>PomoMate</Text>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
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
    marginBottom: 28,
  },
  buddyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
    width: 70,
  },
  buddyLinkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 24,
  },
  statItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 14,
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
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  brandLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});
