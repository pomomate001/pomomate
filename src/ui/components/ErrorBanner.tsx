import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  const colors = useColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.error }]}>
      <Text style={[typography.body, { color: colors.textInverse, flex: 1 }]} numberOfLines={2}>
        {message}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.action}>
          <Text style={[typography.bodyBold, { color: colors.textInverse }]}>Tekrar Dene</Text>
        </Pressable>
      )}
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.action}>
          <Text style={[typography.bodyBold, { color: colors.textInverse }]}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.sm,
    margin: spacing.sm,
  },
  action: { marginLeft: spacing.sm, padding: spacing.xs },
});
