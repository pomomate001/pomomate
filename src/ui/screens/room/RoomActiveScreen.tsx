import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { BackgroundEffect } from '../../animations/BackgroundEffect';
import { RoomTimer } from './features/RoomTimer';
import { RoomCameraGrid } from './features/RoomCameraGrid';
import { RoomScreenPanel } from './features/RoomScreenPanel';
import { RoomViewToggles } from './features/RoomViewToggles';
import { RoomBottomBar } from './RoomBottomBar';
import { useRoomStore, useSettingsStore, useUserStore } from '../../../state';
import { mediaService } from '../../../services/mobile/media/MediaService';

interface RoomActiveScreenProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomActiveScreen({ roomId, onLeave }: RoomActiveScreenProps) {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const colors = useColors();
  const { height: windowHeight } = useWindowDimensions();

  const room = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const viewToggles = useRoomStore((s) => s.viewToggles);
  const toggleView = useRoomStore((s) => s.toggleView);
  const sharedFile = useRoomStore((s) => s.sharedFile);
  const setSharedFile = useRoomStore((s) => s.setSharedFile);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const user = useUserStore((s) => s.user);

  const isHost = !room?.hostId || room.hostId === (user?.id ?? 'host');
  const inviteCode = room?.inviteCode ?? roomId.slice(-6).toUpperCase();

  const participants = [
    {
      userId: user?.id ?? 'my-user',
      displayName: user?.displayName ?? 'Sen (Host)',
      avatarUrl: user?.avatarUrl ?? undefined,
      hasCamera: camOn,
    },
    ...members.map((m) => ({
      userId: m.userId,
      displayName: m.userId.slice(0, 6),
      avatarUrl: undefined,
      hasCamera: false,
    })),
  ];

  /* ─── Media Handlers ─── */

  const handleToggleMic = useCallback(async () => {
    if (!micOn) {
      const stream = await mediaService.getUserMedia({ audio: true, video: camOn });
      if (stream) {
        setMicOn(true);
      } else {
        Alert.alert('Mikrofon İzni Gerekli', 'Sesli çalışma oturumu için mikrofon izni vermelisiniz.');
      }
    } else {
      if (camOn) {
        await mediaService.getUserMedia({ audio: false, video: true });
      } else {
        mediaService.stopUserMedia();
      }
      setMicOn(false);
    }
  }, [micOn, camOn]);

  const handleToggleCam = useCallback(async () => {
    if (!camOn) {
      const stream = await mediaService.getUserMedia({ audio: micOn, video: true });
      if (stream) {
        setCamOn(true);
      } else {
        Alert.alert('Kamera İzni Gerekli', 'Görüntülü çalışma oturumu için kamera izni vermelisiniz.');
      }
    } else {
      if (micOn) {
        await mediaService.getUserMedia({ audio: true, video: false });
      } else {
        mediaService.stopUserMedia();
      }
      setCamOn(false);
    }
  }, [camOn, micOn]);

  const handleToggleScreen = useCallback(async () => {
    if (!screenShareOn) {
      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenShareOn(true);
          stream.getVideoTracks()[0]?.addEventListener('ended', () => {
            setScreenShareOn(false);
          });
        } catch {
          Alert.alert('Ekran Paylaşımı', 'Ekran paylaşımı başlatılamadı.');
        }
      } else {
        Alert.alert(
          'Ekran Paylaşımı',
          'Mobilde ekran paylaşımı henüz desteklenmiyor. "Ekran" panelinden dosya/görsel paylaşabilirsiniz.',
        );
      }
    } else {
      setScreenShareOn(false);
    }
  }, [screenShareOn]);

  /* ─── Share Handler ─── */

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `🍅 PomoMate ile birlikte çalışalım!\n\nOda: ${room?.name ?? 'Çalışma Odası'}\nOda Kodu: ${inviteCode}\n\nPomoMate uygulamasını aç → "Odaya Katıl" → Kodu yapıştır`,
        title: 'PomoMate Çalışma Odası',
      });
    } catch {
      // User cancelled share
    }
  }, [room?.name, inviteCode]);

  /* ─── File Pick Handler ─── */

  const handlePickFile = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName ?? asset.uri.split('/').pop() ?? 'file';
        const fileType = asset.mimeType?.startsWith('image') ? 'image' : 'other';
        setSharedFile({
          uri: asset.uri,
          fileName,
          fileType,
          sharedBy: user?.id ?? 'my-user',
        });
        // Auto-show screen panel when file is shared
        if (!viewToggles.screen) {
          toggleView('screen');
        }
      }
    } catch {
      Alert.alert('Dosya Seçimi', 'Dosya seçilemedi.');
    }
  }, [setSharedFile, user?.id, viewToggles.screen, toggleView]);

  const handleRemoveFile = useCallback(() => {
    setSharedFile(null);
  }, [setSharedFile]);

  /* ─── Calculate active panel count for layout ─── */
  const activePanels = [viewToggles.timer, viewToggles.screen, viewToggles.cameras].filter(Boolean).length;
  const noPanelsActive = activePanels === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BackgroundEffect effectId={backgroundEffectId} />

      {/* ─── Main Content Area ─── */}
      <View style={styles.contentArea}>
        {noPanelsActive && (
          <View style={styles.emptyContent}>
            <Ionicons name="eye-off-outline" size={48} color={colors.textDisabled} />
            <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.md, textAlign: 'center' }]}>
              Sağdaki butonları kullanarak{'\n'}sayaç, ekran veya kameraları gösterebilirsin
            </Text>
          </View>
        )}

        {/* Timer Panel */}
        {viewToggles.timer && (
          <View style={[
            styles.panel,
            {
              backgroundColor: `${colors.card}CC`,
              borderColor: `${colors.border}50`,
              flex: viewToggles.screen || viewToggles.cameras ? 0 : 1,
            },
          ]}>
            <RoomTimer isHost={isHost} />
          </View>
        )}

        {/* Screen / File Share Panel */}
        {viewToggles.screen && (
          <View style={[
            styles.panel,
            {
              backgroundColor: `${colors.card}CC`,
              borderColor: `${colors.border}50`,
              flex: 1,
            },
          ]}>
            <RoomScreenPanel
              sharedFile={sharedFile}
              isScreenSharing={screenShareOn}
              isHost={isHost}
              onPickFile={handlePickFile}
              onRemoveFile={handleRemoveFile}
            />
          </View>
        )}

        {/* Camera Grid Panel */}
        {viewToggles.cameras && (
          <View style={[
            styles.panel,
            {
              backgroundColor: `${colors.card}CC`,
              borderColor: `${colors.border}50`,
              flex: 1,
            },
          ]}>
            <RoomCameraGrid participants={participants} />
          </View>
        )}
      </View>

      {/* ─── Right Side Toggle Buttons ─── */}
      <RoomViewToggles
        viewToggles={viewToggles}
        onToggle={toggleView}
      />

      {/* ─── Bottom Bar ─── */}
      <RoomBottomBar
        roomName={room?.name ?? 'Çalışma Odası'}
        inviteCode={inviteCode}
        isLive={room?.isActive ?? true}
        participants={participants.map((p) => ({
          userId: p.userId,
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
        }))}
        micOn={micOn}
        camOn={camOn}
        screenShareOn={screenShareOn}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onToggleScreen={handleToggleScreen}
        onShare={handleShare}
        onLeave={onLeave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.sm,
    paddingRight: spacing.xxxl + spacing.md, // Space for right-side toggle buttons
    gap: spacing.sm,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  panel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 80,
  },
});
