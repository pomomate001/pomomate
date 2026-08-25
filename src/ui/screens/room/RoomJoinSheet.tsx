import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';

interface RoomJoinSheetProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export function RoomJoinSheet({ visible, onClose, onJoin }: RoomJoinSheetProps) {
  const [code, setCode] = useState('');
  const colors = useColors();

  const handleJoin = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onJoin(trimmed);
    setCode('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Odaya Katıl</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Arkadaşının paylaştığı 6 haneli oda kodunu girerek oturuma katılabilirsin.
          </Text>
        </View>
        
        <Input
          label="Oda Kodu"
          value={code}
          onChangeText={setCode}
          placeholder="Örn: X7A9P2"
          autoCapitalize="characters"
          autoFocus
        />
        
        <View style={styles.footer}>
          <Button 
            title="Odaya Katıl" 
            onPress={handleJoin} 
            disabled={!code.trim()} 
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
