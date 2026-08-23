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
import type { RecurrenceType } from '../../../types';

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, tag: string | null, recurrence: RecurrenceType, targetDate?: string) => void;
  initialDate?: string;
}

const RECURRENCE_OPTIONS: { label: string; value: RecurrenceType }[] = [
  { label: 'Tek Seferlik', value: 'none' },
  { label: 'Her Gün', value: 'daily' },
  { label: 'Hafta İçi', value: 'weekdays' },
  { label: 'Hafta Sonu', value: 'weekends' },
];

export function AddTaskSheet({ visible, onClose, onAdd, initialDate }: AddTaskSheetProps) {
  const colors = useColors();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    
    const trimmedTag = tag.trim() || null;
    onAdd(trimmedTitle, trimmedTag, recurrence, initialDate);
    
    setTitle('');
    setTag('');
    setRecurrence('none');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
        Yeni Görev Ekle
      </Text>

      <Input
        label="Görev Adı"
        placeholder="Örn: 20 sayfa kitap oku"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Input
        label="Etiket (Klas)"
        placeholder="Örn: Biyoloji, Kitap, Spor"
        value={tag}
        onChangeText={setTag}
        leftIcon="pricetag-outline"
      />

      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md }]}>
        Tekrar Etme
      </Text>
      
      <View style={styles.optionsWrap}>
        {RECURRENCE_OPTIONS.map((opt) => {
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
          title="Görevi Ekle" 
          onPress={handleAdd} 
          disabled={!title.trim()} 
          icon={<Ionicons name="add" size={20} color={colors.textInverse} />}
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
