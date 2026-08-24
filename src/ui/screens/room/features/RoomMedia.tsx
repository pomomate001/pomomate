/**
 * Room feature: Camera / Microphone / Screen-share controls.
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { IconButton } from '../../../components/IconButton';
import { permissionManager } from '../../../../services/mobile/permissions/PermissionManager';

export function RoomMedia() {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const colors = useColors();

  const handleToggleMic = async () => {
    if (!micOn) {
      const res = await permissionManager.requestMicrophone();
      if (res.status !== 'granted') {
        Alert.alert('Mikrofon İzni Gerekli', 'Sesli çalışma oturumu için mikrofon izni vermelisiniz.');
        return;
      }
      setMicOn(true);
    } else {
      setMicOn(false);
    }
  };

  const handleToggleCam = async () => {
    if (!camOn) {
      const res = await permissionManager.requestCamera();
      if (res.status !== 'granted') {
        Alert.alert('Kamera İzni Gerekli', 'Görüntülü çalışma oturumu için kamera izni vermelisiniz.');
        return;
      }
      setCamOn(true);
    } else {
      setCamOn(false);
    }
  };

  const handleToggleScreen = () => {
    setScreenShare((v) => !v);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.controlPill, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        {/* Microphone */}
        <View style={styles.btnWrap}>
          <IconButton
            icon={
              <Ionicons
                name={micOn ? 'mic' : 'mic-off'}
                size={20}
                color={micOn ? colors.textInverse : colors.textSecondary}
              />
            }
            onPress={handleToggleMic}
            size={42}
            style={{
              backgroundColor: micOn ? colors.primary : 'transparent',
            }}
          />
          <Text style={[typography.caption, { color: micOn ? colors.primary : colors.textSecondary, marginTop: 2 }]}>
            {micOn ? 'Açık' : 'Kapalı'}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Camera */}
        <View style={styles.btnWrap}>
          <IconButton
            icon={
              <Ionicons
                name={camOn ? 'videocam' : 'videocam-off'}
                size={20}
                color={camOn ? colors.textInverse : colors.textSecondary}
              />
            }
            onPress={handleToggleCam}
            size={42}
            style={{
              backgroundColor: camOn ? colors.primary : 'transparent',
            }}
          />
          <Text style={[typography.caption, { color: camOn ? colors.primary : colors.textSecondary, marginTop: 2 }]}>
            {camOn ? 'Kamera Açık' : 'Kamera'}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Screen share */}
        <View style={styles.btnWrap}>
          <IconButton
            icon={
              <Ionicons
                name={screenShare ? 'desktop' : 'desktop-outline'}
                size={20}
                color={screenShare ? colors.textInverse : colors.textSecondary}
              />
            }
            onPress={handleToggleScreen}
            size={42}
            style={{
              backgroundColor: screenShare ? colors.primary : 'transparent',
            }}
          />
          <Text style={[typography.caption, { color: screenShare ? colors.primary : colors.textSecondary, marginTop: 2 }]}>
            {screenShare ? 'Paylaşılıyor' : 'Ekran'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  btnWrap: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    height: 28,
  },
});
