/**
 * Room feature: Shared task list for the room.
 */
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import type { Task } from '../../../../types';

interface RoomTasksProps {
  tasks: Task[];
}

export function RoomTasks({ tasks }: RoomTasksProps) {
  const colors = useColors();

  if (tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[typography.caption, { color: colors.textDisabled }]}>Henüz görev yok</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(t) => t.id}
      style={styles.list}
      renderItem={({ item }) => (
        <View style={[styles.row, { borderBottomColor: colors.divider }]}>
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={18}
            color={item.completed ? colors.success : colors.textDisabled}
          />
          <Text
            style={[
              typography.body,
              { color: item.completed ? colors.textDisabled : colors.textPrimary, marginLeft: spacing.sm },
              item.completed && { textDecorationLine: 'line-through' as const },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 200 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  empty: { padding: spacing.md, alignItems: 'center' },
});
