import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  return h > 0 ? `${h}s ${m}d` : `${m}dk`;
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
      {/* Header with gradient background */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Text style={[typography.h2, { color: colors.textInverse }]}>İstatistiklerim</Text>
          
          <View style={[styles.periodRow, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            {periods.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.periodTab,
                  p === period && { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: p === period ? colors.primary : colors.textInverse },
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
});
