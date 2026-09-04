import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useStatsStore, useTaskStore } from '../../../state';
import { getTasksForDate } from '../../../state/taskStore';
import { toLocalDateStr, nowIso } from '../../../utils/datetime';
import { generateId } from '../../../utils/id';
import { Card } from '../../components/Card';
import { StatCard } from './StatCard';
import { MiniBarChart } from './MiniBarChart';
import { FriendsSection } from './FriendsSection';
import { CalendarView } from './CalendarView';
import { AddTaskSheet } from '../tasks';
import { AdPlacement } from '../../ads';
import { useTranslation, Language } from '../../../i18n';
import type { Task } from '../../../types';

type Period = 'daily' | 'weekly' | 'monthly';

function formatHours(seconds: number, lang: Language): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (lang === 'en') {
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

function formatSelectedDateHeader(dateStr: string, language: Language): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'short',
      });
    }
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  } catch {
    return dateStr;
  }
}

// Calculate chart data from real recorded daily stats
function computeRealChartData(
  period: Period,
  dailyStats: import('../../../state/statsStore').DailyStat[],
  dayLabels: string[],
  monthLabels: string[],
  weekPrefix: string
) {
  if (period === 'daily') {
    const result: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      const dayLabel = dayLabels[d.getDay()];
      const match = dailyStats.find((s) => s.date === dateStr);
      result.push({
        label: dayLabel,
        value: match ? match.pomodorosCompleted : 0,
      });
    }
    return result;
  }

  if (period === 'weekly') {
    const result: { label: string; value: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const label = `${weekPrefix}${4 - w}`;
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - (w + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      end.setHours(23, 59, 59, 999);

      const startStr = toLocalDateStr(start);
      const endStr = toLocalDateStr(end);

      const total = dailyStats
        .filter((s) => s.date >= startStr && s.date <= endStr)
        .reduce((sum, s) => sum + s.pomodorosCompleted, 0);

      result.push({ label, value: total });
    }
    return result;
  }

  const result: { label: string; value: number }[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = monthLabels[d.getMonth()];
    const total = dailyStats
      .filter((s) => s.date.startsWith(monthPrefix))
      .reduce((sum, s) => sum + s.pomodorosCompleted, 0);
    result.push({ label, value: total });
  }
  return result;
}

export function StatsScreen() {
  const { t, language } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateStr());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAddTaskSheet, setShowAddTaskSheet] = useState(false);

  const { totalPomodoros, totalWorkSeconds, totalTasksCompleted, streak, daily } = useStatsStore();
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const colors = useColors();

  const periodLabels: Record<Period, string> = {
    daily: t('stats.daily'),
    weekly: t('stats.weekly'),
    monthly: t('stats.monthly'),
  };

  const dayLabels = language === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const monthLabels = language === 'en'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const weekPrefix = language === 'en' ? 'W' : 'H';

  const chartData = computeRealChartData(period, daily, dayLabels, monthLabels, weekPrefix);

  const periods: Period[] = ['daily', 'weekly', 'monthly'];
  
  // Extract unique tags from tasks
  const allTags = Array.from(new Set(tasks.map(t => t.tag).filter(Boolean))) as string[];

  const todayStr = toLocalDateStr(new Date());
  const isPastDate = selectedDate < todayStr;

  // Tasks for the selected date (including recurring tasks matching this date)
  const selectedDateTasks = useMemo(() => {
    const allForDate = getTasksForDate(tasks, selectedDate);
    if (!selectedTag) return allForDate;
    return allForDate.filter(t => t.tag === selectedTag);
  }, [tasks, selectedDate, selectedTag]);

  // Compute marked dates (completed tasks + days with recorded pomodoro activity)
  const markedDates = useMemo(() => {
    const set = new Set<string>();
    tasks.filter(t => t.completed && (!selectedTag || t.tag === selectedTag)).forEach(t => {
      if (t.targetDate) set.add(t.targetDate);
    });
    daily.filter(d => d.pomodorosCompleted > 0 || d.tasksCompleted > 0).forEach(d => {
      set.add(d.date);
    });
    return set;
  }, [tasks, daily, selectedTag]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header with gradient background */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>{t('stats.title')}</Text>
          
          <View style={[styles.periodRow, { backgroundColor: colors.surfaceVariant }]}>
            {periods.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.periodTab,
                  p === period && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: p === period ? colors.textInverse : colors.textPrimary },
                  ]}
                >
                  {periodLabels[p]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.contentWrap}>
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagFilterList}>
            <Pressable
              onPress={() => setSelectedTag(null)}
              style={[
                styles.tagChip,
                { backgroundColor: selectedTag === null ? colors.primary : colors.surfaceVariant }
              ]}
            >
              <Text style={[typography.captionBold, { color: selectedTag === null ? colors.textInverse : colors.textPrimary }]}>{t('stats.allTags')}</Text>
            </Pressable>
            {allTags.map(tag => (
              <Pressable
                key={tag}
                onPress={() => setSelectedTag(tag)}
                style={[
                  styles.tagChip,
                  { backgroundColor: selectedTag === tag ? colors.primary : colors.surfaceVariant }
                ]}
              >
                <Text style={[typography.captionBold, { color: selectedTag === tag ? colors.textInverse : colors.textPrimary }]}>{tag}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Summary cards */}
        <View style={styles.cardRow}>
          <StatCard
            icon={<Ionicons name="time-outline" size={24} color={colors.info} />}
            label={t('stats.totalDuration')}
            value={formatHours(totalWorkSeconds, language)}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            icon={<Ionicons name="disc-outline" size={24} color={colors.primary} />}
            label={t('stats.pomodoro')}
            value={String(totalPomodoros)}
          />
        </View>

        <View style={[styles.cardRow, { marginTop: spacing.sm }]}>
          <StatCard
            icon={<Ionicons name="checkmark-done-outline" size={24} color={colors.success} />}
            label={t('stats.tasks')}
            value={String(totalTasksCompleted)}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            icon={<Ionicons name="flame" size={24} color={colors.warning} />}
            label={t('stats.streak')}
            value={`${streak} ${streak === 1 ? t('stats.dayUnit') : t('stats.daysUnit')}`}
          />
        </View>

        {/* Chart */}
        <Card variant="glass" style={styles.chartCard}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            {t('stats.activityTitle')}
          </Text>
          <MiniBarChart data={chartData} />
        </Card>

        {/* Calendar and Tasks for Selected Date (Shown in Monthly view) */}
        {period === 'monthly' && (
          <Card variant="glass" style={styles.chartCard}>
            <CalendarView 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              markedDates={markedDates} 
            />
            
            <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderColor: colors.divider, paddingTop: spacing.md }}>
              <View style={styles.dateTasksHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm }}>
                  <Ionicons name="calendar-outline" size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[typography.captionBold, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={1}>
                    {formatSelectedDateHeader(selectedDate, language)}
                  </Text>
                </View>
                {!isPastDate && (
                  <Pressable
                    onPress={() => setShowAddTaskSheet(true)}
                    style={[styles.addDateTaskBtn, { backgroundColor: `${colors.primary}18`, borderColor: colors.primary }]}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 4, fontSize: 11 }]}>
                      {t('stats.addTaskForDate')}
                    </Text>
                  </Pressable>
                )}
              </View>
              
              {selectedDateTasks.length === 0 ? (
                <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center', marginVertical: spacing.md }]}>
                  {t('stats.noTasksDate')}
                </Text>
              ) : (
                selectedDateTasks.map(tItem => (
                  <View key={tItem.id} style={styles.taskRowItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons 
                        name={tItem.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={18} 
                        color={tItem.completed ? colors.success : colors.textDisabled} 
                        style={{ marginRight: spacing.sm }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.body, { color: tItem.completed ? colors.textDisabled : colors.textPrimary, textDecorationLine: tItem.completed ? 'line-through' : 'none' }]}>
                          {tItem.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6, flexWrap: 'wrap' }}>
                          {tItem.tag && (
                            <Text style={[typography.overline, { color: colors.textSecondary }]}>
                              🏷️ {tItem.tag}
                            </Text>
                          )}
                          {tItem.recurrence && tItem.recurrence.type !== 'none' && (
                            <Text style={[typography.overline, { color: colors.primary }]}>
                              🔁 {tItem.recurrence.type === 'daily' ? t('tasks.recurrenceDaily') : tItem.recurrence.type === 'weekdays' ? t('tasks.recurrenceWeekdays') : t('tasks.recurrenceWeekends')}
                            </Text>
                          )}
                          <Text style={[typography.overline, { color: colors.textSecondary }]}>
                            ⏱️ {tItem.pomodoroCount || 0}/{tItem.targetPomodoroCount || 1} Pomo
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action buttons: prohibited for past dates */}
                    {!isPastDate && (
                      tItem.isVirtualRecurring && tItem.originalTaskId ? (
                        <Pressable
                          onPress={() => {
                            useTaskStore.getState().addRecurrenceException(tItem.originalTaskId!, selectedDate);
                          }}
                          hitSlop={8}
                          style={styles.taskActionBtn}
                          accessibilityLabel={t('stats.skipForDate')}
                        >
                          <Ionicons name="close-circle-outline" size={18} color={colors.warning} />
                        </Pressable>
                      ) : !tItem.completed ? (
                        <Pressable
                          onPress={() => {
                            useTaskStore.getState().removeTask(tItem.id);
                          }}
                          hitSlop={8}
                          style={styles.taskActionBtn}
                          accessibilityLabel={t('stats.deleteScheduledTask')}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </Pressable>
                      ) : null
                    )}
                  </View>
                ))
              )}
            </View>
          </Card>
        )}

        {/* Ad between sections */}
        <AdPlacement size="banner" />

        {/* Friends */}
        <FriendsSection />
      </View>

      <View style={{ height: spacing.xxxl }} />

      {/* Add Task for Selected Date */}
      <AddTaskSheet
        visible={showAddTaskSheet}
        initialDate={selectedDate}
        onClose={() => setShowAddTaskSheet(false)}
        onAdd={(title, tag, recurrence, targetDate, targetPomodoroCount) => {
          const effectiveDate = targetDate || selectedDate;
          if (effectiveDate < todayStr) return;
          const newTask: Task = {
            id: generateId(),
            userId: '',
            title,
            tag,
            recurrence: { type: recurrence },
            targetDate: effectiveDate,
            completed: false,
            pomodoroCount: 0,
            targetPomodoroCount: targetPomodoroCount || 1,
            createdAt: nowIso(),
          };
          addTask(newTask);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  contentWrap: {
    paddingTop: spacing.lg,
  },
  periodRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 24,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  periodTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  chartCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  tagFilterList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  addDateTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  taskRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  taskActionBtn: {
    padding: 6,
    marginLeft: spacing.sm,
  },
});
