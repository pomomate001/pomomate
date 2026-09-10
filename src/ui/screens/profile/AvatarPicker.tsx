import React from 'react';
import { View, Pressable, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import { shadows } from '../../theme/shadows';

interface AvatarPickerProps {
  uri?: string | null;
  name?: string;
  isLoading?: boolean;
  onPick: () => void;
  onRemove: () => void;
}

export function AvatarPicker({ uri, name, isLoading = false, onPick, onRemove }: AvatarPickerProps) {
  const colors = useColors();
  const [scaleAnim] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (isLoading) return;
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (isLoading) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={isLoading ? undefined : onPick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={[styles.avatarWrap, shadows.md, { borderColor: colors.surface }]}>
            <Avatar uri={uri} name={name} size={100} />
            {isLoading ? (
              <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={[styles.badge, shadows.sm, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                <Ionicons name="camera" size={16} color={colors.textInverse} />
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
      
      {uri && !isLoading && (
        <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={10}>
          <Ionicons name="close-circle" size={28} color={colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: spacing.lg, position: 'relative' },
  avatarWrap: {
    borderRadius: 50,
    borderWidth: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: { position: 'absolute', top: -4, right: -4, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
});
