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
import { useUserStore } from '../../../state';
import { useTranslation } from '../../../i18n';

interface LoginScreenProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export function LoginScreen({ onGoToRegister, onGoToForgotPassword }: LoginScreenProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.signInWithEmail(normalizedEmail, password);
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unexpectedError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unexpectedError');
      if (message !== 'Giriş iptal edildi.' && message !== 'Sign in cancelled.') {
        setError(message);
      }
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
            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('auth.welcomeTitle')}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}> 
              {t('auth.welcomeSubtitle')}
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
            placeholder="••••••••"
            leftIcon="lock-closed-outline"
          />

          <View style={{ alignItems: 'flex-end', marginBottom: spacing.lg, marginTop: -spacing.sm }}>
            <Pressable onPress={onGoToForgotPassword} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.primary }]}>{t('auth.forgotPassword')}</Text>
            </Pressable>
          </View>

          {error && (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
              {error}
            </Text>
          )}

          <Button
            title={t('auth.loginBtn')}
            onPress={handleEmailLogin}
            loading={isLoading}
            disabled={isLoading}
            variant="gradient"
            style={styles.primaryButton}
            icon={<Ionicons name="log-in-outline" size={20} color={colors.textInverse} />}
          />

          <Button
            title={t('auth.loginGoogle')}
            onPress={handleGoogleSignIn}
            variant="outline"
            disabled={isLoading}
            icon={<Ionicons name="logo-google" size={18} color={colors.primary} />}
          />

          <View style={styles.footer}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>{t('auth.noAccount')}</Text>
            <Pressable onPress={onGoToRegister} hitSlop={8} style={{ padding: spacing.xs }}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>{t('auth.registerLink')}</Text>
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
