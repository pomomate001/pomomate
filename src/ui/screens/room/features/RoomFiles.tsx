/**
 * Room feature: File / PDF / Image attachments — UI foundation.
 * Actual upload logic belongs to M03/M04.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

export function RoomFiles() {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.dropzone, { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
        onPress={() => {
          /* image-picker will be wired in M04/M05 */
        }}
      >
        <Ionicons name="cloud-upload-outline" size={28} color={colors.textDisabled} />
        <Text style={[typography.caption, { color: colors.textDisabled, marginTop: spacing.xs }]}>
          Dosya, PDF veya resim ekle
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  dropzone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
});
