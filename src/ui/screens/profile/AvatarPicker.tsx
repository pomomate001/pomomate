/**
 * Avatar picker — 1:1 image upload, change, remove.
 * Uses expo-image-picker. Actual upload to backend is M03.
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';

interface AvatarPickerProps {
  uri?: string | null;
  name?: string;
  onPick: () => void;
  onRemove: () => void;
}

export function AvatarPicker({ uri, name, onPick, onRemove }: AvatarPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Pressable onPress={onPick}>
        <Avatar uri={uri} name={name} size={80} />
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera" size={14} color={colors.textInverse} />
        </View>
      </Pressable>
      {uri && (
        <Pressable onPress={onRemove} style={styles.removeBtn}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: spacing.lg },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: { position: 'absolute', top: 0, right: -8 },
});
