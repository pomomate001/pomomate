import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface AddTaskInputProps {
  onAdd: (title: string) => void;
}

export function AddTaskInput({ onAdd }: AddTaskInputProps) {
  const [text, setText] = useState('');
  const colors = useColors();

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Yeni görev ekle…"
        placeholderTextColor={colors.textDisabled}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        style={[typography.body, styles.input, { color: colors.textPrimary }]}
      />
      <Pressable onPress={handleSubmit} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={22} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    margin: spacing.lg,
  },
  input: { flex: 1, paddingVertical: spacing.sm },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
  },
});
