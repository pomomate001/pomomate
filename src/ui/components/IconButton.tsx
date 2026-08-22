import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { radius } from '../theme/radius';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({ icon, onPress, size = 44, style, disabled }: IconButtonProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: radius.full, backgroundColor: colors.surfaceVariant },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
