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

interface RegisterScreenProps {
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const colors = useColors();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Sadece kayıt yapıyoruz, setUser çağırmıyoruz ki ana ekrana atmasın.
      await authService.signUpWithEmail(normalizedEmail, password);
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unexpectedError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.successContainer}>
          <Ionicons name="mail-unread-outline" size={80} color={colors.primary} />
          <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>
            {t('auth.verifyEmailTitle')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', marginHorizontal: spacing.xl }]}>
            {t('auth.verifyEmailBody', { email })}
          </Text>
          <Button
            title={t('auth.backToLogin')}
            onPress={onGoToLogin}
            variant="gradient"
            style={{ marginTop: spacing.xl, width: '80%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('auth.registerTitle')}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}> 
              {t('auth.registerSubtitle')}
            </Text>
          </View>

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

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder={t('auth.passwordMinPlaceholder')}
            leftIcon="lock-closed-outline"
          />

          <Input
            label={t('auth.passwordConfirm')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder={t('auth.passwordConfirmPlaceholder')}
            leftIcon="lock-closed-outline"
          />

          {error && (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
              {error}
            </Text>
          )}

          <Button
            title={t('auth.registerBtn')}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="gradient"
            style={styles.primaryButton}
            icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
          />

          <View style={styles.footer}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('auth.alreadyHaveAccount')}</Text>
            <Pressable onPress={onGoToLogin} hitSlop={8} style={{ padding: spacing.xs }}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>{t('auth.loginLink')}</Text>
            </Pressable>
          </View>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
