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

interface RegisterScreenProps {
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const colors = useColors();
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.signUpWithEmail(normalizedEmail, password);
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt sırasında beklenmeyen bir hata oluştu.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Yeni Hesap Oluştur</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}> 
              Hesabını oluştur, çalışma odalarına katıl ve ilerlemeni takip et.
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
            placeholder="En az 6 karakter"
          />

          <Input
            label="Şifre (Tekrar)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="Şifreni tekrar gir"
          />

          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}> 
            Kayıttan sonra e-posta doğrulama bağlantısı gönderilebilir. Lütfen gelen kutunu kontrol et.
          </Text>

          {error && (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
              {error}
            </Text>
          )}

          <Button
            title="Kayıt Ol"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.primaryButton}
          />

          <View style={styles.footer}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Zaten hesabın var mı?</Text>
            <Pressable onPress={onGoToLogin} hitSlop={8}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}> Giriş yap</Text>
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
