import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { typography } from '../theme/typography';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const colors = useColors();
  const half = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: half }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: half, backgroundColor: colors.primaryLight },
      ]}
    >
      <Text style={[typography.bodyBold, { color: colors.textInverse, fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
