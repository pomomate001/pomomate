import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, shadows.sm, { backgroundColor: colors.card }]}>
      {icon}
      <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xs }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    minWidth: 80,
  },
});
