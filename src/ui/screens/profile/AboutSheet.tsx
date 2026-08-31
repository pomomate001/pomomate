import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheet } from '../../components/BottomSheet';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface AboutSheetProps {
  visible: boolean;
  onClose: () => void;
}

const APP_VERSION = 'v1.0.6';
const BUILD_NUMBER = '6';

const HIGHLIGHTS = [
  {
    icon: 'color-palette-outline',
    title: 'Modern Görünüm & Temalar',
    desc: 'Canlı video arka planlar, parçacık efektleri ve renk temaları',
  },
  {
    icon: 'people-outline',
    title: 'Birlikte Çalışma Odaları',
    desc: 'Arkadaşlarınızla sesli ve görüntülü eşzamanlı odaklanma',
  },
  {
    icon: 'stats-chart-outline',
    title: 'Gelişmiş İstatistikler',
    desc: 'Günlük hedefler, seriler ve detaylı üretkenlik grafikleri',
  },
];

export function AboutSheet({ visible, onClose }: AboutSheetProps) {
  const colors = useColors();

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Ignore URL open errors
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* App Logo & Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoWrap}
          >
            <Ionicons name="timer" size={40} color={colors.textInverse} />
          </LinearGradient>

          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            PomoMate
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Birlikte Odaklan, Daha Fazlasını Başar
          </Text>

          {/* Version Pill */}
          <View style={[styles.versionBadge, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="code-slash-outline" size={13} color={colors.primary} />
            <Text style={[styles.versionText, { color: colors.primary }]}>
              Sürüm {APP_VERSION} ({BUILD_NUMBER})
            </Text>
          </View>
        </View>

        {/* Highlights List */}
        <View style={styles.highlightsContainer}>
          {HIGHLIGHTS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.highlightRow,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.highlightIconBox, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.highlightTextWrap}>
                <Text style={[typography.captionBold, { color: colors.textPrimary, fontSize: 13 }]}>
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11, marginTop: 2 }]}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info & Legal Section */}
        <View style={[styles.infoSection, { borderColor: colors.divider }]}>
          <View style={styles.infoRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Geliştirici</Text>
            <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
              PomoMate Team
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>E-Posta Destek</Text>
            <Pressable onPress={() => handleOpenUrl('mailto:support@pomomate.app')}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                support@pomomate.app
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Action Links */}
        <View style={styles.linksRow}>
          <Pressable
            style={[styles.linkBtn, { borderColor: colors.border }]}
            onPress={() => handleOpenUrl('https://pomomate.app/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Gizlilik Politikası
            </Text>
          </Pressable>

          <Pressable
            style={[styles.linkBtn, { borderColor: colors.border }]}
            onPress={() => handleOpenUrl('https://pomomate.app/terms')}
          >
            <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Kullanım Şartları
            </Text>
          </Pressable>
        </View>

        {/* Copyright */}
        <Text style={[styles.copyrightText, { color: colors.textDisabled }]}>
          © 2026 PomoMate. Tüm hakları saklıdır.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    gap: 6,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  highlightsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  highlightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  highlightTextWrap: {
    flex: 1,
  },
  infoSection: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
});
