import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface AppearanceOptionCardProps {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onPress: () => void;
  isPremium?: boolean;
  isLocked?: boolean;
  renderPreview: () => React.ReactNode;
}

export function AppearanceOptionCard({
  title,
  subtitle,
  isSelected,
  onPress,
  isPremium = false,
  isLocked = false,
  renderPreview,
}: AppearanceOptionCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Top Preview Area */}
      <View style={styles.previewWrap}>
        {renderPreview()}

        {/* Selected or Lock Badge */}
        {isSelected ? (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={13} color={colors.textInverse} />
          </View>
        ) : isLocked ? (
          <View style={[styles.selectedBadge, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
            <Ionicons name="lock-closed" size={11} color="#FFF" />
          </View>
        ) : null}

        {/* Premium Badge */}
        {isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
            <Ionicons name={isLocked ? 'lock-closed' : 'star'} size={10} color={colors.warning} />
            <Text style={[styles.premiumText, { color: colors.warning }]}>PRO</Text>
          </View>
        )}
      </View>

      {/* Bottom Info Area */}
      <View style={styles.infoWrap}>
        <Text
          numberOfLines={1}
          style={[
            typography.captionBold,
            {
              color: isSelected ? colors.primary : colors.textPrimary,
              fontSize: 13,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 2,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: radius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  previewWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoWrap: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
