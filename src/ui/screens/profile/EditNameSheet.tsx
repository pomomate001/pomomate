import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useUserStore } from '../../../state';
import { friendService } from '../../../services/friends/FriendService';

interface EditNameSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function EditNameSheet({ visible, onClose }: EditNameSheetProps) {
  const colors = useColors();
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      Promise.resolve().then(() => setName(user.displayName || ''));
    }
  }, [visible, user]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    setLoading(true);
    try {
      await updateUser({ displayName: trimmed });
      if (user?.id) {
        await Promise.allSettled([
          friendService.fetchFriends(user.id),
          friendService.discoverUsers(user.id),
        ]);
      }
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Kullanıcı Adı</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Diğer kullanıcılar sizi bu adla görecek.
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: colors.surfaceVariant, 
              color: colors.textPrimary,
              borderColor: colors.divider 
            }
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Adınızı girin"
          placeholderTextColor={colors.textSecondary}
          maxLength={30}
          autoFocus
        />

        <Button
          title="Kaydet"
          onPress={handleSave}
          loading={loading}
          disabled={!name.trim() || name.trim() === user?.displayName}
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
  input: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  saveBtn: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  }
});