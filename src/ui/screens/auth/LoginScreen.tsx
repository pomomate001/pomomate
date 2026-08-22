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
import { Input, Button } from '../../components';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { authService } from '../../../services/auth';
import { useUserStore } from '../../../state';

interface LoginScreenProps {
  onGoToRegister: () => void;
}

export function LoginScreen({ onGoToRegister }: LoginScreenProps) {
  const colors = useColors();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.signInWithEmail(normalizedEmail, password);
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş sırasında beklenmeyen bir hata oluştu.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Expo AuthSession ile Supabase Google OAuth entegrasyonu eklenecek.
    setError('Google ile giriş yakında eklenecek.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Hoş geldin</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}> 
              PomoMate hesabınla giriş yap ve birlikte çalışmaya devam et.
            </Text>
          </View>

          <Input
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="ornek@eposta.com"
          />

          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="••••••••"
          />

          {error && (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
              {error}
            </Text>
          )}

          <Button
            title="Giriş Yap"
            onPress={handleEmailLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.primaryButton}
          />

          <Button
            title="Google ile Giriş"
            onPress={handleGoogleSignIn}
            variant="outline"
            disabled={isLoading}
          />

          <View style={styles.footer}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Hesabın yok mu?</Text>
            <Pressable onPress={onGoToRegister} hitSlop={8}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}> Kayıt ol</Text>
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
    marginBottom: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
