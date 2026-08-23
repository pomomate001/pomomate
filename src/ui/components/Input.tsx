import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, containerStyle, onFocus, onBlur, ...props }, ref) => {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [borderAnim] = useState(() => new Animated.Value(0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.primary]
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: borderColor as any,
          }
        ]}
      >
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? colors.primary : colors.textDisabled} 
            style={styles.leftIcon} 
          />
        )}
        <TextInput
          placeholderTextColor={colors.textDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
          style={[
            styles.input,
            typography.body,
            { color: colors.textPrimary }
          ]}
        />
      </Animated.View>
      {error && (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xxs }]}>
          {error}
        </Text>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
