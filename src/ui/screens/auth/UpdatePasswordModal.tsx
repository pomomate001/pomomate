import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Input, Button } from '../../components';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { supabase } from '../../../services/auth';
import { useUserStore } from '../../../state';
import { useTranslation } from '../../../i18n';

export function UpdatePasswordModal() {
  const colors = useColors();
  const { t } = useTranslation();
  const needsReset = useUserStore((s) => s.needsPasswordReset);
  const setNeedsReset = useUserStore((s) => s.setNeedsPasswordReset);
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    
    if (updateError) {
      setError(updateError.message);
    } else {
      setNeedsReset(false);
    }
  };

  return (
    <Modal visible={needsReset} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            {t('auth.setNewPassword')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            {t('auth.enterNewPasswordSubtitle')}
          </Text>

          <Input
            label={t('auth.newPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            leftIcon="lock-closed-outline"
          />

          {error && (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}>
              {error}
            </Text>
          )}

          <Button
            title={t('auth.updatePasswordBtn')}
            onPress={handleUpdate}
            loading={loading}
            disabled={loading}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  }
});
