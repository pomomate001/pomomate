import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { TaskItem } from './TaskItem';
import type { Task } from '../../../types';
import { useTranslation } from '../../../i18n';

interface DraggableTaskListProps {
  tasks: Task[];
  isWorking: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
  onReorder: (newTasks: Task[]) => void;
  onDragBegin?: () => void;
  onDragEnd?: () => void;
}

const ESTIMATED_ITEM_HEIGHT = 72;

export function DraggableTaskList({
  tasks,
  isWorking,
  onToggle,
  onDelete,
  onPress,
  onReorder,
  onDragBegin,
  onDragEnd,
}: DraggableTaskListProps) {
  const colors = useColors();
  const { t } = useTranslation();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [translateY] = useState(() => new Animated.Value(0));

  const [dragState] = useState(() => ({
    draggingIndex: -1,
    targetIndex: -1,
    tasks,
    onReorder,
    onDragEnd,
  }));

  useEffect(() => {
    dragState.tasks = tasks;
    dragState.onReorder = onReorder;
    dragState.onDragEnd = onDragEnd;
  });

  const finishDrag = () => {
    const fromIndex = dragState.draggingIndex;
    const toIndex = dragState.targetIndex;

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const reordered = [...dragState.tasks];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      dragState.onReorder(reordered);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    dragState.draggingIndex = -1;
    dragState.targetIndex = -1;
    setDraggingId(null);
    setTargetIndex(null);
    translateY.setValue(0);
    dragState.onDragEnd?.();
  };

  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => dragState.draggingIndex !== -1,
      onPanResponderGrant: () => {
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (dragState.draggingIndex === -1) return;
        translateY.setValue(gestureState.dy);

        const deltaIndex = Math.round(gestureState.dy / ESTIMATED_ITEM_HEIGHT);
        const newTarget = Math.max(
          0,
          Math.min(dragState.tasks.length - 1, dragState.draggingIndex + deltaIndex)
        );

        if (newTarget !== dragState.targetIndex) {
          dragState.targetIndex = newTarget;
          setTargetIndex(newTarget);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderRelease: () => {
        finishDrag();
      },
      onPanResponderTerminate: () => {
        finishDrag();
      },
    })
  );

  const handleStartDrag = (task: Task, index: number) => {
    dragState.draggingIndex = index;
    dragState.targetIndex = index;
    setDraggingId(task.id);
    setTargetIndex(index);
    translateY.setValue(0);
    onDragBegin?.();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.listContainer} {...panResponder.panHandlers}>
      {tasks.map((task, index) => {
        const isThisItemDragging = draggingId === task.id;
        const isTopActive = index === 0 && isWorking && !task.completed;
        const isTargetSlot = draggingId !== null && targetIndex === index && !isThisItemDragging;

        return (
          <Animated.View
            key={task.id}
            style={[
              styles.taskCard,
              {
                backgroundColor: 'rgba(15, 18, 28, 0.78)',
                borderColor: isThisItemDragging
                  ? colors.primary
                  : isTargetSlot
                  ? `${colors.primary}80`
                  : isTopActive
                  ? colors.primary
                  : 'rgba(255, 255, 255, 0.15)',
                borderWidth: isThisItemDragging || isTargetSlot || isTopActive ? 1.5 : 1,
                zIndex: isThisItemDragging ? 999 : 1,
                elevation: isThisItemDragging ? 12 : 0,
                shadowColor: isThisItemDragging ? colors.primary : 'transparent',
                shadowOpacity: isThisItemDragging ? 0.45 : 0,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                transform: isThisItemDragging
                  ? [{ translateY }, { scale: 1.03 }]
                  : [{ scale: 1 }],
              },
            ]}
          >
            {/* Working on Indicator for top uncompleted task */}
            {isTopActive && !isThisItemDragging && (
              <View style={[styles.workingIndicator, { backgroundColor: colors.primary }]}>
                <Ionicons name="radio" size={8} color={colors.textInverse} />
                <Text
                  style={[
                    typography.overline,
                    { color: colors.textInverse, marginLeft: 3, fontSize: 8 },
                  ]}
                >
                  {t('timer.workingOn')}
                </Text>
              </View>
            )}

            {/* Long-pressable surface for dragging */}
            <Pressable
              onLongPress={() => handleStartDrag(task, index)}
              delayLongPress={220}
              style={{ transform: [{ scale: 0.95 }] }}
            >
              <TaskItem
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onPress={onPress}
              />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
    gap: spacing.xs,
  },
  taskCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  workingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
