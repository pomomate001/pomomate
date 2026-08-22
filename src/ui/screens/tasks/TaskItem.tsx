import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import type { Task } from '../../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragHandle?: () => void;
}

export function TaskItem({ task, onToggle, onDelete, onDragHandle }: TaskItemProps) {
  const colors = useColors();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
      {/* Drag handle */}
      <Pressable onLongPress={onDragHandle} style={styles.handle}>
        <Ionicons name="reorder-three" size={20} color={colors.textDisabled} />
      </Pressable>

      {/* Checkbox */}
      <Pressable onPress={() => onToggle(task.id)} style={styles.checkWrap}>
        <Ionicons
          name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.completed ? colors.success : colors.textDisabled}
        />
      </Pressable>

      {/* Title + pomodoro count */}
      <View style={styles.content}>
        <Text
          style={[
            typography.body,
            { color: task.completed ? colors.textDisabled : colors.textPrimary },
            task.completed && styles.strikethrough,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.pomodoroCount > 0 && (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            🍅 {task.pomodoroCount}
          </Text>
        )}
      </View>

      {/* Delete */}
      <Pressable onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderRadius: radius.sm,
    marginBottom: spacing.xxs,
  },
  handle: { padding: spacing.xs, marginRight: spacing.xs },
  checkWrap: { marginRight: spacing.sm },
  content: { flex: 1 },
  strikethrough: { textDecorationLine: 'line-through' },
  deleteBtn: { padding: spacing.xs },
});
