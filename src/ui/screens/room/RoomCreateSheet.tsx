import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { spacing } from '../../theme/spacing';

interface RoomCreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function RoomCreateSheet({ visible, onClose, onCreate }: RoomCreateSheetProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Input
        label="Oda Adı"
        value={name}
        onChangeText={setName}
        placeholder="Oda adını girin…"
        autoFocus
      />
      <View style={styles.footer}>
        <Button title="Oluştur" onPress={handleCreate} disabled={!name.trim()} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: spacing.md },
});
