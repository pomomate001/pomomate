import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';

interface RoomCreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function RoomCreateSheet({ visible, onClose, onCreate }: RoomCreateSheetProps) {
  const [name, setName] = useState('');
  const colors = useColors();

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Yeni Çalışma Odası</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Arkadaşlarınla odaklanmak için özel bir alan yarat
          </Text>
        </View>
        
        <Input
          label="Oda Adı"
          value={name}
          onChangeText={setName}
          placeholder="Örn: Hafta Sonu Maratonu"
          autoFocus
        />
        
        <View style={styles.footer}>
          <Button 
            title="Odayı Oluştur" 
            onPress={handleCreate} 
            disabled={!name.trim()} 
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
