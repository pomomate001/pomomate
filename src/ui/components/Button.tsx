import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
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
  const [scale] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const baseContainerStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size].container,
    ...(variant === 'primary' && { backgroundColor: colors.primary, ...shadows.sm }),
    ...(variant === 'secondary' && { backgroundColor: colors.surfaceVariant }),
    ...(variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const textColor =
    variant === 'gradient' ? colors.textPrimary :
    variant === 'primary' ? colors.textInverse :
    variant === 'outline' || variant === 'ghost' ? colors.primary :
    colors.textPrimary;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text style={[typography.bodyBold, sizeStyles[size].text, { color: textColor, marginLeft: icon ? spacing.xs : 0 }]}>
            {title}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, disabled && styles.disabled]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          variant !== 'gradient' && baseContainerStyle,
          pressed && variant !== 'gradient' && styles.pressed,
        ]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[baseContainerStyle, styles.gradientContainer]}
          >
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    borderWidth: 0,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
