import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  // A set of YYYY-MM-DD that have completed tasks
  markedDates: Set<string>;
}

export function CalendarView({ selectedDate, onSelectDate, markedDates }: CalendarViewProps) {
  const colors = useColors();

  // Simple current month grid
  const { days, monthLabel } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 0 = Sunday, 1 = Monday. We want Monday to be first, so:
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    
    const daysArr = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArr.push(null); // empty cells
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      daysArr.push(d.toISOString().split('T')[0]);
    }

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return { days: daysArr, monthLabel: `${monthNames[month]} ${year}` };
  }, []);

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <View style={styles.container}>
      <Text style={[typography.bodyBold, { color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' }]}>
        {monthLabel}
      </Text>

      <View style={styles.weekRow}>
        {weekDays.map(wd => (
          <Text key={wd} style={[typography.caption, styles.weekDay, { color: colors.textSecondary }]}>{wd}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d, index) => {
          if (!d) return <View key={`empty-${index}`} style={styles.cell} />;
          
          const isSelected = d === selectedDate;
          const isMarked = markedDates.has(d);
          const isToday = d === new Date().toISOString().split('T')[0];

          return (
            <Pressable
              key={d}
              onPress={() => onSelectDate(d)}
              style={[
                styles.cell,
                isSelected && { backgroundColor: colors.primary, borderRadius: radius.full },
                isToday && !isSelected && { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.full }
              ]}
            >
              <Text style={[
                typography.captionBold,
                { color: isSelected ? colors.textInverse : colors.textPrimary }
              ]}>
                {parseInt(d.split('-')[2], 10)}
              </Text>
              {isMarked && (
                <View style={[styles.dot, { backgroundColor: isSelected ? colors.textInverse : colors.success }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  }
});
