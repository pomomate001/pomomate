import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { useTranslation } from '../../../i18n';

interface RoomJoinSheetProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

function extractRoomCode(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  // Check for URL query param (?room=... or &room=...)
  const urlMatch = trimmed.match(/[?&]room=([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toUpperCase();
  }
  // Check for labeled text like "Oda Kodu: BZPN6A" or "Katılım Kodu: BZPN6A"
  const labelMatch = trimmed.match(/(?:oda\s*kodu|katılım\s*kodu|kod|code)[\s:\n]*([a-zA-Z0-9]{4,10})/i);
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1].toUpperCase();
  }
  // If it's a short alphanumeric string (4 to 12 chars), return it uppercase
  const alphanumericOnly = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (alphanumericOnly.length >= 4 && alphanumericOnly.length <= 12) {
    return alphanumericOnly.toUpperCase();
  }
  return trimmed.toUpperCase();
}

export function RoomJoinSheet({ visible, onClose, onJoin }: RoomJoinSheetProps) {
  const [code, setCode] = useState('');
  const colors = useColors();
  const { t } = useTranslation();

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        const clean = extractRoomCode(text);
        if (clean) {
          setCode(clean);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleCodeChange = (text: string) => {
    // If user pasted a full URL or message, auto-extract
    if (text.includes('?') || text.includes('http') || text.includes('\n') || text.length > 15) {
      setCode(extractRoomCode(text));
    } else {
      setCode(text.toUpperCase());
    }
  };

  const handleJoin = () => {
    const clean = extractRoomCode(code);
    if (!clean) return;
    onJoin(clean);
    setCode('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('rooms.joinRoomTitle')}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {t('rooms.joinRoomSubtitle')}
          </Text>
        </View>
        
        <Input
          label={t('rooms.roomCodeLabel')}
          value={code}
          onChangeText={handleCodeChange}
          placeholder={t('rooms.roomCodePlaceholder')}
          autoCapitalize="characters"
          autoFocus
        />

        <Pressable
          style={[styles.pasteBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]}
          onPress={handlePasteFromClipboard}
        >
          <Ionicons name="clipboard-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[typography.captionBold, { color: colors.primary }]}>{t('common.pasteFromClipboard')}</Text>
        </Pressable>
        
        <View style={styles.footer}>
          <Button 
            title={t('rooms.joinRoomBtn')} 
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
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
