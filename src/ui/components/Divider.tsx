import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  const colors = useColors();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
        style,
      ]}
    />
  );
}
