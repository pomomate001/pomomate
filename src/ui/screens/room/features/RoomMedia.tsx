/**
 * Room feature: Camera / Microphone / Screen-share controls.
 *
 * Integrates with MediaService for real audio/video streams
 * and provides platform-appropriate screen sharing behavior.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { IconButton } from '../../../components/IconButton';
import { mediaService } from '../../../../services/mobile/media/MediaService';
import type { MediaStream } from 'react-native-webrtc';

interface RoomMediaProps {
  onStreamChange?: (stream: MediaStream | null) => void;
}

export function RoomMedia({ onStreamChange }: RoomMediaProps) {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const colors = useColors();

  const handleToggleMic = useCallback(async () => {
    if (!micOn) {
      // Start audio stream
      const stream = await mediaService.getUserMedia({ audio: true, video: camOn });
      if (stream) {
        setMicOn(true);
        onStreamChange?.(stream);
      } else {
        Alert.alert(
          'Mikrofon İzni Gerekli',
          'Sesli çalışma oturumu için mikrofon izni vermelisiniz.',
        );
      }
    } else {
      // If camera is still on, restart with just video
      if (camOn) {
        const stream = await mediaService.getUserMedia({ audio: false, video: true });
        onStreamChange?.(stream);
      } else {
        mediaService.stopUserMedia();
        onStreamChange?.(null);
      }
      setMicOn(false);
    }
  }, [micOn, camOn, onStreamChange]);

  const handleToggleCam = useCallback(async () => {
    if (!camOn) {
      // Start video stream (include audio if mic is already on)
      const stream = await mediaService.getUserMedia({ audio: micOn, video: true });
      if (stream) {
        setCamOn(true);
        onStreamChange?.(stream);
      } else {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Görüntülü çalışma oturumu için kamera izni vermelisiniz.',
        );
      }
    } else {
      // If mic is still on, restart with just audio
      if (micOn) {
        const stream = await mediaService.getUserMedia({ audio: true, video: false });
        onStreamChange?.(stream);
      } else {
        mediaService.stopUserMedia();
        onStreamChange?.(null);
      }
      setCamOn(false);
    }
  }, [camOn, micOn, onStreamChange]);

  const handleToggleScreen = useCallback(async () => {
    if (!screenShare) {
      if (Platform.OS === 'web') {
        // Web: use getDisplayMedia
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenShare(true);
          onStreamChange?.(stream as any);
          // Listen for user stopping screen share via browser UI
          stream.getVideoTracks()[0]?.addEventListener('ended', () => {
            setScreenShare(false);
            onStreamChange?.(null);
          });
        } catch {
          Alert.alert('Ekran Paylaşımı', 'Ekran paylaşımı başlatılamadı.');
        }
      } else {
        // Native: screen sharing requires react-native-webrtc native module
        Alert.alert(
          'Ekran Paylaşımı',
          'Mobilde ekran paylaşımı henüz desteklenmiyor. Bunun yerine "Ekran" panelinden dosya/görsel paylaşabilirsiniz.',
          [{ text: 'Tamam' }],
        );
      }
    } else {
      setScreenShare(false);
      // Stop screen share tracks
      const localStream = mediaService.getLocalStream();
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          if (track.label.includes('screen') || track.label.includes('display')) {
            track.stop();
          }
        });
      }
      onStreamChange?.(null);
    }
  }, [screenShare, onStreamChange]);

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
