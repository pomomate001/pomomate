import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
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
  onPress?: (task: Task) => void;
  onDragHandle?: () => void;
  isActive?: boolean;
  isWorkingTask?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, onPress, onDragHandle, isActive, isWorkingTask }: TaskItemProps) {
  const colors = useColors();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <View style={[
      styles.row, 
      { backgroundColor: isActive ? colors.surfaceVariant : colors.surface },
      isActive && { elevation: 5, shadowOpacity: 0.2, shadowRadius: 5 },
      isWorkingTask && { borderColor: colors.primary, borderWidth: 1 }
    ]}>
      {/* Drag Handle */}
      {onDragHandle && (
        <Pressable onLongPress={onDragHandle} style={styles.dragHandle}>
          <Ionicons name="menu-outline" size={24} color={colors.textDisabled} />
        </Pressable>
      )}

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

      {/* Title + pomodoro count */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          {!!task.tag && (
            <View style={[styles.tagBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                🏷️ {task.tag}
              </Text>
            </View>
          )}
          {task.pomodoroCount > 0 && (
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: task.tag ? spacing.sm : 0 }]}>
              🍅 {task.pomodoroCount}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Delete */}
      <Pressable onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.textDisabled} />
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
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  dragHandle: { marginRight: spacing.sm, padding: 4 },
  checkWrap: { marginRight: spacing.md },
  content: { flex: 1 },
  strikethrough: { textDecorationLine: 'line-through' },
  deleteBtn: { padding: spacing.xs, opacity: 0.6 },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
