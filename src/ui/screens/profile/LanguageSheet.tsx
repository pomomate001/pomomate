import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useTranslation, Language } from '../../../i18n';

interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface LanguageOption {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'tr',
    name: 'Türkçe',
    nativeName: 'Varsayılan',
    flag: '🇹🇷',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
  },
];

export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const colors = useColors();
  const { language, setLanguage, t } = useTranslation();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {t('profile.languageTitle')}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            {t('profile.languageSubtitle')}
          </Text>
        </View>

        <View style={styles.list}>
          {LANGUAGES.map((langOpt, index) => {
            const isSelected = language === langOpt.id;

            return (
              <Pressable
                key={langOpt.id}
                onPress={() => handleSelect(langOpt.id)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.flagWrap}>
                  <Text style={{ fontSize: 24 }}>{langOpt.flag}</Text>
                </View>

                <View style={styles.infoCol}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {langOpt.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {langOpt.nativeName}
                  </Text>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={colors.textDisabled} />
                )}
              </Pressable>
            );
          })}
        </View>
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
  list: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  flagWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
});
