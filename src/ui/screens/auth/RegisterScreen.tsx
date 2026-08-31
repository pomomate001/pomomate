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

interface RegisterScreenProps {
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const colors = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      // Sadece kayıt yapıyoruz, setUser çağırmıyoruz ki ana ekrana atmasın.
      await authService.signUpWithEmail(normalizedEmail, password);
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt sırasında beklenmeyen bir hata oluştu.';
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
            E-postanı Doğrula
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', marginHorizontal: spacing.xl }]}>
            {email} adresine bir doğrulama bağlantısı gönderdik. Lütfen e-postanı kontrol et ve hesabını doğrula.
          </Text>
          <Button
            title="Giriş Sayfasına Dön"
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
            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>Yeni Hesap</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}> 
              PomoMate&apos;e katıl ve odaklanmaya başla.
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
            leftIcon="mail-outline"
          />

          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="En az 6 karakter"
            leftIcon="lock-closed-outline"
          />

          <Input
            label="Şifre (Tekrar)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="Şifreni tekrar gir"
            leftIcon="lock-closed-outline"
          />

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
            variant="gradient"
            style={styles.primaryButton}
            icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
          />

          <View style={styles.footer}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Zaten hesabın var mı?</Text>
            <Pressable onPress={onGoToLogin} hitSlop={8} style={{ padding: spacing.xs }}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>Giriş yap</Text>
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
