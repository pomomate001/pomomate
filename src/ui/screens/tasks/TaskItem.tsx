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
  onDragHandle?: () => void;
}

export function TaskItem({ task, onToggle, onDelete, onDragHandle }: TaskItemProps) {
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
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
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
      <View style={styles.content}>
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
        {task.pomodoroCount > 0 && (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            🍅 {task.pomodoroCount}
          </Text>
        )}
      </View>

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
  checkWrap: { marginRight: spacing.md },
  content: { flex: 1 },
  strikethrough: { textDecorationLine: 'line-through' },
  deleteBtn: { padding: spacing.xs, opacity: 0.6 },
});
