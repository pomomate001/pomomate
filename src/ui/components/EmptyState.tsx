import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[typography.subtitle, { color: colors.textPrimary, textAlign: 'center' }]}>
        {title}
      </Text>
      {message && (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { marginBottom: spacing.lg },
  actionWrap: { marginTop: spacing.lg },
});
