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
import { useTaskStore, useStatsStore, useUserStore } from '../../../state';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { EmptyState } from '../../components/EmptyState';
import { TaskItem } from './TaskItem';
import { AddTaskInput } from './AddTaskInput';
import { generateId } from '../../../utils/id';
import { nowIso, toLocalDateStr } from '../../../utils/datetime';
import type { Task } from '../../../types';
import { useTranslation } from '../../../i18n';
import { statsService } from '../../../services/stats';

export function TaskListScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const removeTask = useTaskStore((s) => s.removeTask);
  const recordTaskCompleted = useStatsStore((s) => s.recordTaskCompleted);
  const undoTaskCompleted = useStatsStore((s) => s.undoTaskCompleted);
  const user = useUserStore((s) => s.user);
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
        targetPomodoroCount: 1,
        targetDate: toLocalDateStr(),
        createdAt: nowIso(),
      };
      addTask(task);
    },
    [addTask],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        if (!task.completed) {
          recordTaskCompleted();
          if (user?.id) {
            statsService.recordCompletedTask(user.id, task.title);
          }
        } else {
          undoTaskCompleted();
          if (user?.id) {
            statsService.undoCompletedTask(user.id, task.title);
          }
        }
      }
      toggleCompleted(id);
    },
    [tasks, toggleCompleted, recordTaskCompleted, undoTaskCompleted, user],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task?.completed) {
        undoTaskCompleted();
        if (user?.id) {
          statsService.undoCompletedTask(user.id, task.title);
        }
      }
      removeTask(id);
    },
    [tasks, removeTask, undoTaskCompleted, user],
  );

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem task={item} onToggle={handleToggle} onDelete={handleDelete} />
    ),
    [handleToggle, handleDelete],
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
