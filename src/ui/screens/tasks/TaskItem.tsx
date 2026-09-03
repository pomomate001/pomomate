import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Task } from '../../../types';
import { useTranslation } from '../../../i18n';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onPress }: TaskItemProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <View style={[styles.row]}>
      {/* Checkbox */}
      <Pressable onPress={handleToggle} style={styles.checkWrap}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={28}
            color={task.completed ? colors.success : colors.textDisabled}
          />
        </Animated.View>
      </Pressable>

      {/* Title + tag + pomodoro count */}
      <Pressable style={styles.content} onPress={() => onPress && onPress(task)}>
        <Text
          style={[
            typography.bodyBold,
            { color: task.completed ? colors.textDisabled : colors.textPrimary },
            task.completed && styles.strikethrough,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          {!!task.tag && (
            <View style={[styles.tagBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                🏷️ {task.tag}
              </Text>
            </View>
          )}
          <View style={[styles.tagBadge, { backgroundColor: `${colors.primary}18` }]}>
            <Text style={[typography.captionBold, { color: task.completed ? colors.textDisabled : colors.primary, fontSize: 11 }]}>
              ⏱️ {task.pomodoroCount || 0}/{task.targetPomodoroCount || 1} Pomo
            </Text>
          </View>
          {task.recurrence && task.recurrence.type !== 'none' && (
            <View style={[styles.tagBadge, { backgroundColor: `${colors.info}15` }]}>
              <Ionicons name="repeat" size={10} color={colors.info} />
              <Text style={[typography.caption, { color: colors.info, marginLeft: 2 }]}>
                {task.recurrence.type === 'daily'
                  ? t('tasks.recurrenceDaily')
                  : task.recurrence.type === 'weekdays'
                  ? t('tasks.recurrenceWeekdays')
                  : t('tasks.recurrenceWeekends')}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Delete */}
      <Pressable onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.textDisabled} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  checkWrap: { marginRight: spacing.md },
  content: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  strikethrough: { textDecorationLine: 'line-through' },
  deleteBtn: { padding: spacing.xs, opacity: 0.6 },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
