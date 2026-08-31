import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, PomoMateIcon } from '../../components';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { authService } from '../../../services/auth';
import { useTranslation } from '../../../i18n';

interface ForgotPasswordScreenProps {
  onGoBack: () => void;
}

export function ForgotPasswordScreen({ onGoBack }: ForgotPasswordScreenProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t('auth.enterEmailWarning'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await authService.resetPassword(normalizedEmail);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unexpectedError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <PomoMateIcon size={64} />
            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('auth.forgotPasswordTitle')}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}> 
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </View>

          {success ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.body, { color: colors.success, marginBottom: spacing.lg, textAlign: 'center' }]}>
                {t('auth.resetLinkSent')}
              </Text>
              <Button
                title={t('auth.backToLogin')}
                onPress={onGoBack}
                variant="outline"
              />
            </View>
          ) : (
            <>
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder={t('auth.emailPlaceholder')}
                leftIcon="mail-outline"
              />

              {error && (
                <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
                  {error}
                </Text>
              )}

              <Button
                title={t('auth.sendResetLink')}
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                variant="gradient"
                style={styles.primaryButton}
              />

              <View style={styles.footer}>
                <Pressable onPress={onGoBack} hitSlop={8} style={{ padding: spacing.xs }}>
                  <Text style={[typography.bodyBold, { color: colors.primary }]}>{t('auth.backLink')}</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
