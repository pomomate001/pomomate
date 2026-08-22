import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md }, text: { fontSize: 12 } },
  md: { container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }, text: { fontSize: 14 } },
  lg: { container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl }, text: { fontSize: 16 } },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const colors = useColors();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size].container,
    ...(variant === 'primary' && { backgroundColor: colors.primary }),
    ...(variant === 'secondary' && { backgroundColor: colors.surfaceVariant }),
    ...(variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const textColor =
    variant === 'primary' ? colors.textInverse :
    variant === 'outline' || variant === 'ghost' ? colors.primary :
    colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[typography.bodyBold, sizeStyles[size].text, { color: textColor, marginLeft: icon ? spacing.xs : 0 }]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  pressed: { opacity: 0.8 },
});
