import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useUserStore } from '../../../state';
import { useTranslation } from '../../../i18n';

const BIO_MAX_LENGTH = 120;

interface EditBioSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function EditBioSheet({ visible, onClose }: EditBioSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      Promise.resolve().then(() => setBio(user.bio || ''));
    }
  }, [visible, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({ bio: bio.trim() || null });
      Alert.alert('✓', t('profile.bioSaved'));
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const remaining = BIO_MAX_LENGTH - bio.length;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </View>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {t('profile.myCorner')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {t('profile.myCornerHint')}
          </Text>
        </View>

        {/* Input */}
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceVariant, borderColor: colors.divider }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={bio}
            onChangeText={(text) => setBio(text.slice(0, BIO_MAX_LENGTH))}
            placeholder={t('profile.myCornerPlaceholder')}
            placeholderTextColor={colors.textDisabled}
            maxLength={BIO_MAX_LENGTH}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <Text
            style={[
              typography.caption,
              {
                color: remaining < 20 ? colors.warning : colors.textDisabled,
                textAlign: 'right',
                marginTop: spacing.xs,
              },
            ]}
          >
            {remaining}/{BIO_MAX_LENGTH}
          </Text>
        </View>

        {/* Save Button */}
        <Button
          title={t('common.save') || 'Kaydet'}
          onPress={handleSave}
          loading={loading}
          disabled={bio.trim() === (user?.bio || '')}
          style={styles.saveBtn}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  inputWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  input: {
    ...typography.body,
    minHeight: 80,
    fontSize: 15,
    lineHeight: 22,
  },
  saveBtn: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
