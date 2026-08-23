import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../theme';
import { typography } from '../theme/typography';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showGradientBorder?: boolean;
  isOnline?: boolean;
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

export function Avatar({ uri, name, size = 40, showGradientBorder = false, isOnline = false }: AvatarProps) {
  const colors = useColors();
  const half = size / 2;
  const padding = showGradientBorder ? 3 : 0;
  const innerSize = size - padding * 2;
  const innerHalf = innerSize / 2;

  const renderContent = () => {
    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={[styles.image, { width: innerSize, height: innerSize, borderRadius: innerHalf }]}
        />
      );
    }
    return (
      <View
        style={[
          styles.fallback,
          { width: innerSize, height: innerSize, borderRadius: innerHalf, backgroundColor: colors.primaryLight },
        ]}
      >
        <Text style={[typography.bodyBold, { color: colors.textInverse, fontSize: innerSize * 0.38 }]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      {showGradientBorder ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBorder, { width: size, height: size, borderRadius: half, padding }]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        renderContent()
      )}
      
      {isOnline && (
        <View style={[
          styles.onlineIndicator, 
          { 
            backgroundColor: colors.success, 
            borderColor: colors.surface,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: size * 0.125,
            borderWidth: Math.max(2, size * 0.05)
          }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  gradientBorder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
});
