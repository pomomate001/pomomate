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
import { Input, Button } from '../../components';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { authService } from '../../../services/auth';

interface ForgotPasswordScreenProps {
  onGoBack: () => void;
}

export function ForgotPasswordScreen({ onGoBack }: ForgotPasswordScreenProps) {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await authService.resetPassword(normalizedEmail);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu.';
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
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="lock-open" size={36} color={colors.primary} />
            </View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>Şifreni Sıfırla</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}> 
              E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
            </Text>
          </View>

          {success ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.body, { color: colors.success, marginBottom: spacing.lg, textAlign: 'center' }]}>
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
              </Text>
              <Button
                title="Girişe Dön"
                onPress={onGoBack}
                variant="outline"
              />
            </View>
          ) : (
            <>
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

              {error && (
                <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}> 
                  {error}
                </Text>
              )}

              <Button
                title="Sıfırlama Bağlantısı Gönder"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                variant="gradient"
                style={styles.primaryButton}
              />

              <View style={styles.footer}>
                <Pressable onPress={onGoBack} hitSlop={8} style={{ padding: spacing.xs }}>
                  <Text style={[typography.bodyBold, { color: colors.primary }]}>Geri Dön</Text>
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
