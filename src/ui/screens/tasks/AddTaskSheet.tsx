import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import type { Task, RecurrenceType } from '../../../types';
import { useTranslation } from '../../../i18n';

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, tag: string | null, recurrence: RecurrenceType, targetDate?: string) => void;
  onEdit?: (id: string, updates: Partial<Task>) => void;
  initialDate?: string;
  initialTask?: Task;
}

export function AddTaskSheet({ visible, onClose, onAdd, onEdit, initialDate, initialTask }: AddTaskSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [prevTask, setPrevTask] = useState<Task | undefined>(undefined);
  const [prevVisible, setPrevVisible] = useState(false);

  const recurrenceOptions: { label: string; value: RecurrenceType }[] = [
    { label: t('tasks.recurrenceNone'), value: 'none' },
    { label: t('tasks.recurrenceDaily'), value: 'daily' },
    { label: t('tasks.recurrenceWeekdays'), value: 'weekdays' },
    { label: t('tasks.recurrenceWeekends'), value: 'weekends' },
  ];

  if (visible !== prevVisible || initialTask !== prevTask) {
    setPrevVisible(visible);
    setPrevTask(initialTask);
    if (visible) {
      setTitle(initialTask?.title || '');
      setTag(initialTask?.tag || '');
      setRecurrence(initialTask?.recurrence?.type || 'none');
    }
  }

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    
    const trimmedTag = tag.trim() || null;

    if (initialTask && onEdit) {
      onEdit(initialTask.id, {
        title: trimmedTitle,
        tag: trimmedTag,
        recurrence: { type: recurrence }
      });
    } else {
      onAdd(trimmedTitle, trimmedTag, recurrence, initialDate);
    }
    
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
        {initialTask ? t('tasks.editTask') : t('tasks.addNewTask')}
      </Text>

      <Input
        label={t('tasks.taskTitle')}
        placeholder={t('tasks.taskTitlePlaceholder')}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Input
        label={t('tasks.tagLabel')}
        placeholder={t('tasks.tagPlaceholder')}
        value={tag}
        onChangeText={setTag}
        leftIcon="pricetag-outline"
      />

      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md }]}>
        {t('tasks.recurrence')}
      </Text>
      
      <View style={styles.optionsWrap}>
        {recurrenceOptions.map((opt) => {
          const isSelected = recurrence === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setRecurrence(opt.value)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  borderColor: isSelected ? colors.primary : colors.border,
                }
              ]}
            >
              <Text style={[
                typography.captionBold,
                { color: isSelected ? colors.textInverse : colors.textPrimary }
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button 
          title={initialTask ? t('tasks.saveBtn') : t('tasks.addTaskBtn')} 
          onPress={handleSave} 
          disabled={!title.trim()} 
          icon={<Ionicons name={initialTask ? "save" : "add"} size={20} color={colors.textInverse} />}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
