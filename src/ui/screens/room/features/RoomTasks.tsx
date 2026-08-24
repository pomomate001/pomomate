/**
 * Room feature: Shared task list for the room.
 */
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useTaskStore, useStatsStore } from '../../../../state';
import type { Task } from '../../../../types';

interface RoomTasksProps {
  tasks: Task[];
  onAddTask?: () => void;
}

export function RoomTasks({ tasks, onAddTask }: RoomTasksProps) {
  const colors = useColors();
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const removeTask = useTaskStore((s) => s.removeTask);
  const recordTaskCompleted = useStatsStore((s) => s.recordTaskCompleted);

  const handleToggle = (task: Task) => {
    if (!task.completed) {
      recordTaskCompleted();
    }
    toggleCompleted(task.id);
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="clipboard-outline" size={36} color={colors.textDisabled} />
        <Text style={[typography.caption, { color: colors.textDisabled, marginTop: spacing.xs, textAlign: 'center' }]}>
          Bu odaya henüz ortak görev eklenmedi.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(t) => t.id}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View
          style={[
            styles.row,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Checkbox */}
          <Pressable onPress={() => handleToggle(item)} hitSlop={8} style={styles.checkBtn}>
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={item.completed ? colors.success : colors.textDisabled}
            />
          </Pressable>

          {/* Task Info */}
          <View style={styles.content}>
            <Text
              style={[
                typography.bodyBold,
                {
                  color: item.completed ? colors.textDisabled : colors.textPrimary,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {!!item.tag && (
              <View style={[styles.tagBadge, { backgroundColor: colors.surface }]}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  🏷️ {item.tag}
                </Text>
              </View>
            )}
          </View>

          {/* Delete Task */}
          <Pressable onPress={() => removeTask(item.id)} hitSlop={10} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 260 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
  },
  checkBtn: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    opacity: 0.8,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
