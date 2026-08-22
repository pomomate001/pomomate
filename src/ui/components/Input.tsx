import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.textDisabled}
        {...props}
        style={[
          styles.input,
          typography.body,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surfaceVariant,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      />
      {error && (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xxs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
