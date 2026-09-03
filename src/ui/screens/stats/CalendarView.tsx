import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { toLocalDateStr } from '../../../utils/datetime';
import { useTranslation } from '../../../i18n';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  markedDates: Set<string>;
}

interface CalendarDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export function CalendarView({ selectedDate, onSelectDate, markedDates }: CalendarViewProps) {
  const colors = useColors();
  const { language } = useTranslation();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1);
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(toLocalDateStr(now));
  };

  const todayStr = toLocalDateStr();
  const isCurrentMonthNow = useMemo(() => {
    const now = new Date();
    return (
      now.getFullYear() === currentMonthDate.getFullYear() &&
      now.getMonth() === currentMonthDate.getMonth()
    );
  }, [currentMonthDate]);

  const { days, monthLabel } = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // 0 = Sunday, 1 = Monday. Align Monday to first column:
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysArr: CalendarDay[] = [];

    // Fill leading days from previous month for full balanced grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      daysArr.push({
        dateStr: toLocalDateStr(prevDate),
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Fill current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      daysArr.push({
        dateStr: toLocalDateStr(d),
        dayNumber: i,
        isCurrentMonth: true,
      });
    }

    // Fill trailing days for next month to complete the row (multiples of 7)
    const remaining = (7 - (daysArr.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      daysArr.push({
        dateStr: toLocalDateStr(nextDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    const trMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    const enMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const months = language === 'en' ? enMonths : trMonths;
    return { days: daysArr, monthLabel: `${months[month]} ${year}` };
  }, [currentMonthDate, language]);

  const weekDays = language === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={handlePrevMonth}
          hitSlop={12}
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </Pressable>

        <View style={[styles.monthBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Ionicons name="calendar" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 15 }]}>
            {monthLabel}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {!isCurrentMonthNow && (
            <Pressable
              onPress={handleToday}
              hitSlop={8}
              style={[styles.todayBtn, { backgroundColor: `${colors.primary}18`, borderColor: colors.primary }]}
            >
              <Text style={[typography.overline, { color: colors.primary, fontSize: 10 }]}>
                {language === 'en' ? 'Today' : 'Bugün'}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNextMonth}
            hitSlop={12}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Names Header */}
      <View style={[styles.weekRow, { borderColor: `${colors.textDisabled}20` }]}>
        {weekDays.map((wd, i) => {
          const isWeekend = i >= 5;
          return (
            <View key={wd} style={styles.weekDayCell}>
              <Text
                style={[
                  typography.captionBold,
                  styles.weekDayText,
                  { color: isWeekend ? colors.primary : colors.textSecondary, opacity: isWeekend ? 0.9 : 0.75 },
                ]}
              >
                {wd}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Spacious 7-Column Day Grid */}
      <View style={styles.grid}>
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const isMarked = markedDates.has(item.dateStr);
          const isToday = item.dateStr === todayStr;

          return (
            <View key={item.dateStr} style={styles.cellContainer}>
              <Pressable
                onPress={() => onSelectDate(item.dateStr)}
                style={({ pressed }) => [
                  styles.dayButton,
                  isSelected && [
                    styles.daySelected,
                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                  ],
                  isToday && !isSelected && [
                    styles.dayToday,
                    { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
                  ],
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    styles.dayNumberText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? colors.primary
                        : item.isCurrentMonth
                        ? colors.textPrimary
                        : colors.textDisabled,
                      fontWeight: isSelected || isToday ? '700' : item.isCurrentMonth ? '600' : '400',
                      opacity: isSelected || isToday ? 1 : item.isCurrentMonth ? 0.95 : 0.35,
                    },
                  ]}
                >
                  {item.dayNumber}
                </Text>

                {/* Activity Indicator Dot */}
                {isMarked && (
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                      },
                    ]}
                  />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  todayBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  weekRow: {
    flexDirection: 'row',
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  weekDayText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  cellContainer: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumberText: {
    fontSize: 15,
  },
  daySelected: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  dayToday: {
    borderWidth: 1.5,
  },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 3,
  },
});
