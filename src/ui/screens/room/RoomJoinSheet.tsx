import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { spacing } from '../../theme/spacing';

interface RoomJoinSheetProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export function RoomJoinSheet({ visible, onClose, onJoin }: RoomJoinSheetProps) {
  const [code, setCode] = useState('');

  const handleJoin = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onJoin(trimmed);
    setCode('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Input
        label="Oda Kodu"
        value={code}
        onChangeText={setCode}
        placeholder="Oda kodunu girin…"
        autoCapitalize="none"
        autoFocus
      />
      <View style={styles.footer}>
        <Button title="Katıl" onPress={handleJoin} disabled={!code.trim()} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: spacing.md },
});
