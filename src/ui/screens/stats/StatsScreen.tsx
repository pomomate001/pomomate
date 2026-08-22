/**
 * Statistics / progress screen.
 *
 * Layout:
 *   İstatistiklerim
 *     → Günlük / Haftalık / Aylık tab
 *     → Summary cards (toplam süre, pomodoro, görev, streak)
 *     → Bar chart
 *     → Arkadaşlar ▼ (collapsible)
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useStatsStore } from '../../../state';
import { Card } from '../../components/Card';
import { StatCard } from './StatCard';
import { MiniBarChart } from './MiniBarChart';
import { FriendsSection } from './FriendsSection';
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
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

// Mock chart data — replaced by real data in M03
function mockChartData(period: Period) {
  if (period === 'daily') {
    return ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((label, i) => ({
      label,
      value: Math.floor(Math.random() * 8) + 1,
    }));
  }
  if (period === 'weekly') {
    return ['H1', 'H2', 'H3', 'H4'].map((label) => ({
      label,
      value: Math.floor(Math.random() * 30) + 5,
    }));
  }
  return ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'].map((label) => ({
    label,
    value: Math.floor(Math.random() * 100) + 10,
  }));
}

export function StatsScreen() {
  const [period, setPeriod] = useState<Period>('daily');
  const { totalPomodoros, totalWorkSeconds, totalTasksCompleted, streak } = useStatsStore();
  const colors = useColors();
  const chartData = mockChartData(period);

  const periods: Period[] = ['daily', 'weekly', 'monthly'];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[typography.h2, styles.title, { color: colors.textPrimary }]}>İstatistiklerim</Text>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.periodTab,
              {
                backgroundColor: p === period ? colors.primary : colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                { color: p === period ? colors.textInverse : colors.textSecondary },
              ]}
            >
              {periodLabels[p]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary cards */}
      <View style={styles.cardRow}>
        <StatCard
          icon={<Ionicons name="time-outline" size={20} color={colors.info} />}
          label="Toplam Süre"
          value={formatHours(totalWorkSeconds)}
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          icon={<Text style={{ fontSize: 18 }}>🍅</Text>}
          label="Pomodoro"
          value={String(totalPomodoros)}
        />
      </View>

      <View style={[styles.cardRow, { marginTop: spacing.sm }]}>
        <StatCard
          icon={<Ionicons name="checkmark-done-outline" size={20} color={colors.success} />}
          label="Görev"
          value={String(totalTasksCompleted)}
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          icon={<Text style={{ fontSize: 18 }}>🔥</Text>}
          label="Streak"
          value={`${streak} gün`}
        />
      </View>

      {/* Chart */}
      <Card style={styles.chartCard}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Pomodoro — {periodLabels[period]}
        </Text>
        <MiniBarChart data={chartData} />
      </Card>

      {/* Ad between sections */}
      <AdPlacement size="banner" />

      {/* Friends */}
      <FriendsSection />

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: spacing.md },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  periodTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  chartCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
});
