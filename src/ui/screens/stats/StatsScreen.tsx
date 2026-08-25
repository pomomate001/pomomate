import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useStatsStore, useTaskStore } from '../../../state';
import { Card } from '../../components/Card';
import { StatCard } from './StatCard';
import { MiniBarChart } from './MiniBarChart';
import { FriendsSection } from './FriendsSection';
import { CalendarView } from './CalendarView';
import { AdPlacement } from '../../ads';

type Period = 'daily' | 'weekly' | 'monthly';

const periodLabels: Record<Period, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
};

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
}

// Calculate chart data from real recorded daily stats
function computeRealChartData(period: Period, dailyStats: import('../../../state/statsStore').DailyStat[]) {
  const dayLabels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const monthLabels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  if (period === 'daily') {
    const result: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
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
      const label = `H${4 - w}`;
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);

      const total = dailyStats
        .filter((s) => {
          const sd = new Date(s.date);
          return sd >= start && sd <= end;
        })
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
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { totalPomodoros, totalWorkSeconds, totalTasksCompleted, streak, daily } = useStatsStore();
  const tasks = useTaskStore((s) => s.tasks);
  const colors = useColors();
  const chartData = computeRealChartData(period, daily);

  const periods: Period[] = ['daily', 'weekly', 'monthly'];
  
  // Extract unique tags from tasks
  const allTags = Array.from(new Set(tasks.map(t => t.tag).filter(Boolean))) as string[];

  // Tasks for the selected date (and optionally filtered by tag)
  const selectedDateTasks = tasks.filter(t => 
    t.targetDate === selectedDate && (!selectedTag || t.tag === selectedTag)
  );

  // Compute marked dates (dates with at least one completed task, optionally filtered by tag)
  const markedDates = new Set(
    tasks
      .filter(t => t.completed && (!selectedTag || t.tag === selectedTag))
      .map(t => t.targetDate)
      .filter(Boolean) as string[]
  );

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
          <Text style={[typography.h2, { color: colors.textPrimary }]}>İstatistiklerim</Text>
          
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
              <Text style={[typography.captionBold, { color: selectedTag === null ? colors.textInverse : colors.textPrimary }]}>Tümü</Text>
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
            label="Toplam Süre"
            value={formatHours(totalWorkSeconds)}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            icon={<Text style={{ fontSize: 22 }}>🍅</Text>}
            label="Pomodoro"
            value={String(totalPomodoros)}
          />
        </View>

        <View style={[styles.cardRow, { marginTop: spacing.sm }]}>
          <StatCard
            icon={<Ionicons name="checkmark-done-outline" size={24} color={colors.success} />}
            label="Görev"
            value={String(totalTasksCompleted)}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            icon={<Text style={{ fontSize: 22 }}>🔥</Text>}
            label="Streak"
            value={`${streak} gün`}
          />
        </View>

        {/* Chart */}
        <Card variant="glass" style={styles.chartCard}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            POMODORO AKTİVİTESİ
          </Text>
          <MiniBarChart data={chartData} />
        </Card>

        {/* Calendar and Tasks for Selected Date (Only shown in Monthly view as requested) */}
        {period === 'monthly' && (
          <Card variant="glass" style={styles.chartCard}>
            <CalendarView 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              markedDates={markedDates} 
            />
            
            <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderColor: colors.divider, paddingTop: spacing.md }}>
              <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                {selectedDate} GÖREVLERİ
              </Text>
              
              {selectedDateTasks.length === 0 ? (
                <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center', marginVertical: spacing.md }]}>
                  Bu tarihte görev yok.
                </Text>
              ) : (
                selectedDateTasks.map(t => (
                  <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                    <Ionicons 
                      name={t.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={20} 
                      color={t.completed ? colors.success : colors.textDisabled} 
                      style={{ marginRight: spacing.sm }}
                    />
                    <Text style={[typography.body, { color: t.completed ? colors.textDisabled : colors.textPrimary, textDecorationLine: t.completed ? 'line-through' : 'none' }]}>
                      {t.title}
                    </Text>
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
  }
});
