import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      <Text style={[typography.subtitle, { color: colors.textPrimary }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
