/**
 * Minimal bar chart — pure RN Views, no chart library needed.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface BarData {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  data: BarData[];
  barColor?: string;
  height?: number;
}

export function MiniBarChart({ data, barColor, height = 100 }: MiniBarChartProps) {
  const colors = useColors();
  const max = Math.max(...data.map((d) => d.value), 1);
  const color = barColor ?? colors.primary;

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((d, i) => {
        const barH = (d.value / max) * height;
        return (
          <View key={i} style={styles.col}>
            <View
              style={[
                styles.bar,
                {
                  height: barH,
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  col: { alignItems: 'center', flex: 1, marginHorizontal: 2 },
  bar: { width: '60%', borderRadius: radius.xs, minHeight: 2 },
});
