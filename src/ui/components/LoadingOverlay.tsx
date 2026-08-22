import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export function LoadingOverlay({ message, visible = true }: LoadingOverlayProps) {
  const colors = useColors();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
      <View style={[styles.box, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  box: {
    padding: spacing.xxl,
    borderRadius: 16,
    alignItems: 'center',
  },
});
