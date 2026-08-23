import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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

function Bar({ d, max, height, color, index }: { d: BarData, max: number, height: number, color: string, index: number }) {
  const colors = useColors();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 50,
      useNativeDriver: false,
    }).start();
  }, [anim, index]);

  const targetHeight = (d.value / max) * height;
  const animHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, targetHeight]
  });

  return (
    <View style={styles.col}>
      <View style={styles.barWrap}>
        <Animated.View
          style={[
            styles.bar,
            {
              height: animHeight,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {d.label}
      </Text>
    </View>
  );
}

export function MiniBarChart({ data, barColor, height = 120 }: MiniBarChartProps) {
  const colors = useColors();
  const max = Math.max(...data.map((d) => d.value), 1);
  const color = barColor ?? colors.primary;

  return (
    <View style={[styles.container, { height: height + 30 }]}>
      {data.map((d, i) => (
        <Bar key={i} d={d} max={max} height={height} color={color} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  col: { alignItems: 'center', flex: 1 },
  barWrap: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: '50%', borderRadius: radius.xs, minHeight: 4 },
});
