/**
 * Room feature: Camera / Microphone / Screen-share controls.
 *
 * Actual WebRTC implementation is in M04. This is the UI-only shell.
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { IconButton } from '../../../components/IconButton';

export function RoomMedia() {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const colors = useColors();

  return (
    <View style={styles.row}>
      <IconButton
        icon={
          <Ionicons
            name={micOn ? 'mic' : 'mic-off'}
            size={22}
            color={micOn ? colors.primary : colors.textDisabled}
          />
        }
        onPress={() => setMicOn((v) => !v)}
      />
      <IconButton
        icon={
          <Ionicons
            name={camOn ? 'videocam' : 'videocam-off'}
            size={22}
            color={camOn ? colors.primary : colors.textDisabled}
          />
        }
        onPress={() => setCamOn((v) => !v)}
      />
      <IconButton
        icon={
          <Ionicons
            name={screenShare ? 'desktop' : 'desktop-outline'}
            size={22}
            color={screenShare ? colors.primary : colors.textDisabled}
          />
        }
        onPress={() => setScreenShare((v) => !v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.sm },
});
