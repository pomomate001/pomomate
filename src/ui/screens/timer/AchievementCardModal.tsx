import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AchievementCard } from './AchievementCard';
import { useTranslation } from '../../../i18n';
import { useUserStore, useStatsStore, useTaskStore } from '../../../state';
import { toLocalDateStr } from '../../../utils/datetime';

interface AchievementCardModalProps {
  visible: boolean;
  onClose: () => void;
  completedDurationSeconds: number;
}

export function AchievementCardModal({ visible, onClose, completedDurationSeconds }: AchievementCardModalProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const viewShotRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const user = useUserStore((s) => s.user);
  const stats = useStatsStore();
  const tasks = useTaskStore((s) => s.tasks);

  // Calculate today's stats
  const todayStr = toLocalDateStr();
  const todayStat = stats.daily.find((d) => d.date === todayStr);
  const todayPomodoros = todayStat?.pomodorosCompleted ?? 0;
  const todayDurationMinutes = Math.round((todayStat?.totalSeconds ?? 0) / 60);
  const completedDurationMinutes = Math.round(completedDurationSeconds / 60);

  // Find active task
  const activeTask = tasks.find((t) => t.targetDate === todayStr && !t.completed);
  // Or find the most recently completed task for today
  const recentCompletedTask = tasks.find((t) => t.targetDate === todayStr && t.completed);
  const taskName = activeTask?.title || recentCompletedTask?.title;

  // Entrance animation
  React.useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleShare = useCallback(async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('timer.achievementShare'),
        });
      }
    } catch (error) {
      console.warn('[AchievementCard] Share failed:', error);
    }
  }, [t]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Achievement Card */}
          <AchievementCard
            ref={viewShotRef}
            userName={user?.displayName || t('profile.userDefault')}
            avatarUrl={user?.avatarUrl ?? undefined}
            taskName={taskName}
            todayPomodoros={todayPomodoros}
            todayDurationMinutes={todayDurationMinutes}
            streak={stats.streak}
            completedDurationMinutes={completedDurationMinutes}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>{t('timer.achievementShare')}</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={[styles.continueBtn, { borderColor: 'rgba(255,255,255,0.3)' }]}
            >
              <Text style={[styles.continueBtnText, { color: 'rgba(255,255,255,0.8)' }]}>
                {t('timer.achievementContinue')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 380,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
