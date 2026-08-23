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
    <View style={[styles.row, { backgroundColor: colors.surfaceVariant }]}>
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
        <Ionicons name="add" size={24} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
    height: 56,
  },
  input: { flex: 1, height: '100%' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
});
