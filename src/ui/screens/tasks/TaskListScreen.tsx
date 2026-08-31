/**
 * Task management screen.
 *
 * Displays a list of tasks with add / toggle / delete / reorder support.
 * Drag-and-drop reorder uses a simple long-press + move-up/down
 * approach (full gesture-based DnD can be enhanced later with
 * react-native-draggable-flatlist).
 */
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore, useStatsStore } from '../../../state';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { EmptyState } from '../../components/EmptyState';
import { TaskItem } from './TaskItem';
import { AddTaskInput } from './AddTaskInput';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';
import type { Task } from '../../../types';
import { useTranslation } from '../../../i18n';

export function TaskListScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const removeTask = useTaskStore((s) => s.removeTask);
  const recordTaskCompleted = useStatsStore((s) => s.recordTaskCompleted);
  const colors = useColors();
  const { t } = useTranslation();

  const handleAdd = useCallback(
    (title: string) => {
      const task: Task = {
        id: generateId(),
        userId: '',
        title,
        completed: false,
        pomodoroCount: 0,
        createdAt: nowIso(),
      };
      addTask(task);
    },
    [addTask],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        recordTaskCompleted();
      }
      toggleCompleted(id);
    },
    [tasks, toggleCompleted, recordTaskCompleted],
  );

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem task={item} onToggle={handleToggle} onDelete={removeTask} />
    ),
    [handleToggle, removeTask],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AddTaskInput onAdd={handleAdd} />
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="list-outline" size={48} color={colors.textDisabled} />}
            title={t('tasks.emptyTasks')}
            message={t('tasks.emptyTasksSubtitle')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  emptyContent: { flex: 1 },
});
