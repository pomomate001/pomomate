import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MediaStream } from 'react-native-webrtc';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { BackgroundEffect } from '../../animations/BackgroundEffect';
import { RoomTimerBar } from './features/RoomTimerBar';
import { RoomCameraGrid } from './features/RoomCameraGrid';
import { RoomScreenPanel } from './features/RoomScreenPanel';
import { RoomViewToggles } from './features/RoomViewToggles';
import { RoomBottomBar } from './RoomBottomBar';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { useRoomStore, useSettingsStore, useUserStore, useTaskStore } from '../../../state';
import { mediaService } from '../../../services/mobile/media/MediaService';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';

interface RoomActiveScreenProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomActiveScreen({ roomId, onLeave }: RoomActiveScreenProps) {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const insets = useSafeAreaInsets();
  const colors = useColors();

  const room = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const viewToggles = useRoomStore((s) => s.viewToggles);
  const toggleView = useRoomStore((s) => s.toggleView);
  const sharedFile = useRoomStore((s) => s.sharedFile);
  const setSharedFile = useRoomStore((s) => s.setSharedFile);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const user = useUserStore((s) => s.user);
  const addTask = useTaskStore((s) => s.addTask);

  const isHost = !room?.hostId || room.hostId === (user?.id ?? 'host');
  const inviteCode = room?.inviteCode ?? roomId.slice(-6).toUpperCase();

  const participants = [
    {
      userId: user?.id ?? 'my-user',
      displayName: user?.displayName ?? 'Sen (Host)',
      avatarUrl: user?.avatarUrl ?? undefined,
      hasCamera: camOn,
      hasMic: micOn,
      stream: camOn ? localStream : null,
      isLocal: true,
    },
    ...members.map((m) => ({
      userId: m.userId,
      displayName: m.userId.slice(0, 6),
      avatarUrl: undefined,
      hasCamera: false,
      hasMic: false,
      stream: null,
      isLocal: false,
    })),
  ];

  /* ─── Media Handlers ─── */

  const handleToggleMic = useCallback(async () => {
    if (!micOn) {
      const stream = await mediaService.getUserMedia({ audio: true, video: camOn });
      if (stream) {
        setMicOn(true);
        if (camOn) setLocalStream(stream);
      } else {
        Alert.alert('Mikrofon İzni Gerekli', 'Sesli çalışma oturumu için mikrofon izni vermelisiniz.');
      }
    } else {
      if (camOn) {
        const stream = await mediaService.getUserMedia({ audio: false, video: true });
        if (stream) setLocalStream(stream);
      } else {
        mediaService.stopUserMedia();
        setLocalStream(null);
      }
      setMicOn(false);
    }
  }, [micOn, camOn]);

  const handleToggleCam = useCallback(async () => {
    if (!camOn) {
      const stream = await mediaService.getUserMedia({ audio: micOn, video: true });
      if (stream) {
        setCamOn(true);
        setLocalStream(stream);
        // Auto-open cameras grid if closed
        if (!viewToggles.cameras) {
          toggleView('cameras');
        }
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
      setLocalStream(null);
    }
  }, [camOn, micOn, viewToggles.cameras, toggleView]);

  const handleToggleScreen = useCallback(async () => {
    if (!isHost) {
      Alert.alert('Yetkisiz İşlem', 'Sadece oda yöneticisi ekran paylaşımı yapabilir.');
      return;
    }

    if (!screenShareOn) {
      try {
        const stream = await mediaService.getDisplayMedia();
        if (stream) {
          setScreenShareOn(true);
          setScreenStream(stream);
          
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.onended = () => {
              setScreenShareOn(false);
              setScreenStream(null);
            };
          }
          if (!viewToggles.screen) {
            toggleView('screen');
          }
        } else {
          Alert.alert('Ekran Paylaşımı', 'Ekran paylaşımı başlatılamadı veya iptal edildi.');
        }
      } catch (err) {
        Alert.alert('Ekran Paylaşımı', 'Ekran paylaşımı başlatılamadı.');
      }
    } else {
      setScreenShareOn(false);
      setScreenStream(null);
    }
  }, [screenShareOn, isHost, viewToggles.screen, toggleView]);

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

  /* ─── Task Handler ─── */

  const handleAddTask = (title: string, tag: string | null, recurrence: any) => {
    addTask({
      id: generateId(),
      userId: user?.id ?? 'my-user',
      roomId,
      title,
      tag,
      recurrence: { type: recurrence },
      targetDate: new Date().toISOString().split('T')[0],
      completed: false,
      pomodoroCount: 0,
      createdAt: nowIso(),
    });
  };

  /* ─── Calculate active panel count for layout ─── */
  const activePanels = [viewToggles.screen, viewToggles.cameras].filter(Boolean).length;
  const noPanelsActive = activePanels === 0 && !viewToggles.timer;

  return (
    <BackgroundEffect effectId={backgroundEffectId}>
      {/* Task Creation Sheet for Room */}
      <AddTaskSheet
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
      />

      {/* ─── Dynamic Island Timer Bar (highest z-index) ─── */}
      {viewToggles.timer && (
        <RoomTimerBar
          roomId={roomId}
          isHost={isHost}
          onOpenAddTask={() => setShowAddTask(true)}
        />
      )}

      {/* ─── Main Content Area (fills space between top and bottom bar) ─── */}
      <View
        style={[
          styles.contentArea,
          {
            paddingTop: insets.top + 16, // Fixed padding, timer is absolute overlay
            paddingBottom: 90, // Space for collapsed bottom bar
          },
        ]}
      >
        {noPanelsActive && (
          <View style={styles.emptyContent}>
            <Ionicons name="eye-off-outline" size={48} color={colors.textDisabled} />
            <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.md, textAlign: 'center' }]}>
              Sağdaki butonları kullanarak{'\n'}ekran veya kameraları gösterebilirsin
            </Text>
          </View>
        )}

        {/* Screen / File Share Panel — fills available space */}
        {viewToggles.screen && (
          <View
            style={[
              styles.fullPanel,
              {
                backgroundColor: `${colors.card}E6`,
                borderColor: `${colors.border}80`,
                flex: 1, // Always takes all remaining space
              },
            ]}
          >
            <RoomScreenPanel
              sharedFile={sharedFile}
              isScreenSharing={screenShareOn}
              screenStream={screenStream}
              isHost={isHost}
              onPickFile={handlePickFile}
              onRemoveFile={handleRemoveFile}
            />
          </View>
        )}

        {/* Camera Grid (Compact PIP if screen is also active) */}
        {viewToggles.cameras && viewToggles.screen && (
           <View style={[styles.floatingCamera, { top: insets.top + 80 }]}>
             <RoomCameraGrid participants={participants} isCompact={true} />
           </View>
        )}

        {/* Camera Grid Panel (Full Screen) — when only cameras are active */}
        {viewToggles.cameras && !viewToggles.screen && (
          <View
            style={[
              styles.fullPanel,
              {
                backgroundColor: `${colors.card}E6`,
                borderColor: `${colors.border}80`,
                flex: 1,
              },
            ]}
          >
            <RoomCameraGrid participants={participants} />
          </View>
        )}
      </View>

      {/* ─── Right Side Floating Toggle Buttons ─── */}
      <RoomViewToggles
        viewToggles={viewToggles}
        onToggle={toggleView}
      />

      {/* ─── Collapsible Bottom Bar with Chat ─── */}
      <RoomBottomBar
        roomId={roomId}
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
    </BackgroundEffect>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingCamera: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 50,
  }
});
