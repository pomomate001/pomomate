import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export interface BarData {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  data: BarData[];
  barColor?: string;
  height?: number;
  selectedIndex?: number | null;
  onSelectBar?: (index: number | null) => void;
}

function Bar({
  d,
  max,
  height,
  color,
  index,
  isSelected,
  onPress,
}: {
  d: BarData;
  max: number;
  height: number;
  color: string;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 35,
      useNativeDriver: false,
    }).start();
  }, [anim, d.value, d.label, index]);

  const targetHeight = max > 0 ? (d.value / max) * height : 0;
  const animHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(targetHeight, 4)],
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.col}
      hitSlop={{ top: 12, bottom: 8, left: 4, right: 4 }}
    >
      <View style={[styles.barWrap, { height: height + 26 }]}>
        {isSelected && (
          <View style={styles.valueContainer}>
            <Text
              style={[
                styles.valueText,
                {
                  color: colors.textPrimary,
                },
              ]}
              numberOfLines={1}
            >
              {d.value}
            </Text>
          </View>
        )}
        <Animated.View
          style={[
            styles.bar,
            {
              height: animHeight,
              backgroundColor: isSelected ? colors.primaryLight || color : color,
              opacity: isSelected ? 1 : 0.88,
              borderWidth: isSelected ? 1 : 0,
              borderColor: colors.textPrimary,
            },
          ]}
        />
      </View>
      <Text
        style={[
          typography.caption,
          {
            color: isSelected ? colors.textPrimary : colors.textSecondary,
            fontWeight: isSelected ? '700' : '400',
            marginTop: 4,
          },
        ]}
      >
        {d.label}
      </Text>
    </Pressable>
  );
}

export function MiniBarChart({
  data,
  barColor,
  height = 120,
  selectedIndex,
  onSelectBar,
}: MiniBarChartProps) {
  const colors = useColors();
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalSelected;

  const handlePress = (index: number) => {
    const next = activeIndex === index ? null : index;
    if (onSelectBar) {
      onSelectBar(next);
    }
    setInternalSelected(next);
  };

  const max = Math.max(...data.map((d) => d.value), 1);
  const color = barColor ?? colors.primary;

  return (
    <View style={[styles.container, { height: height + 36 }]}>
      {data.map((d, i) => (
        <Bar
          key={`${d.label}-${i}`}
          d={d}
          max={max}
          height={height}
          color={color}
          index={i}
          isSelected={activeIndex === i}
          onPress={() => handlePress(i)}
        />
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
  valueContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});

