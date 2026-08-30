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
  const [isScreenShrunk, setIsScreenShrunk] = useState(false);

  const insets = useSafeAreaInsets();
  const colors = useColors();

  const room = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const viewToggles = useRoomStore((s) => s.viewToggles);
  const toggleView = useRoomStore((s) => s.toggleView);
  
  const sharedFiles = useRoomStore((s) => s.sharedFiles);
  const activeSharedFileId = useRoomStore((s) => s.activeSharedFileId);
  const addSharedFile = useRoomStore((s) => s.addSharedFile);
  const removeSharedFile = useRoomStore((s) => s.removeSharedFile);
  const setActiveSharedFileId = useRoomStore((s) => s.setActiveSharedFileId);
  const roomSettings = useRoomStore((s) => s.roomSettings);
  
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
    if (!isHost && !roomSettings.allowMic) {
      Alert.alert('Yetkiniz Yok', 'Yönetici mikrofon kullanımını kapattı.');
      return;
    }

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
  }, [micOn, camOn, isHost, roomSettings.allowMic]);

  const handleToggleCam = useCallback(async () => {
    if (!isHost && !roomSettings.allowCamera) {
      Alert.alert('Yetkiniz Yok', 'Yönetici kamera kullanımını kapattı.');
      return;
    }

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
  }, [camOn, micOn, viewToggles.cameras, toggleView, isHost, roomSettings.allowCamera]);

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
              setIsScreenShrunk(false); // Reset shrink when screen ends
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
      setIsScreenShrunk(false);
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
    if (!isHost && !roomSettings.allowFiles) {
      Alert.alert('Yetkiniz Yok', 'Yönetici dosya paylaşımını kapattı.');
      return;
    }

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
        const newFileId = generateId();
        addSharedFile({
          id: newFileId,
          uri: asset.uri,
          fileName,
          fileType,
          sharedBy: user?.id ?? 'my-user',
        });
        setActiveSharedFileId(newFileId);
        // Auto-show screen panel when file is shared
        if (!viewToggles.screen) {
          toggleView('screen');
        }
      }
    } catch {
      Alert.alert('Dosya Seçimi', 'Dosya seçilemedi.');
    }
  }, [addSharedFile, setActiveSharedFileId, user?.id, viewToggles.screen, toggleView, isHost, roomSettings.allowFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    removeSharedFile(fileId);
    // If we removed the active file, shrink the screen to avoid empty space if desired
    // Or we just let it show the dropzone
  }, [removeSharedFile]);

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
  
  // When both are active, show the shrink toggle
  const showShrinkToggle = viewToggles.cameras && viewToggles.screen;

  const activeSharedFile = sharedFiles.find(f => f.id === activeSharedFileId) || null;

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

        {/* Camera Grid (Compact PIP if screen is also active) */}
        {viewToggles.cameras && viewToggles.screen && (
           <View style={
             isScreenShrunk 
               ? { marginTop: viewToggles.timer ? 64 : 0, marginBottom: spacing.sm, zIndex: 10 } 
               : [styles.floatingCamera, { top: insets.top + 80 }]
           }>
             <RoomCameraGrid participants={participants} isCompact={true} />
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
              sharedFile={activeSharedFile}
              isScreenSharing={screenShareOn}
              screenStream={screenStream}
              isHost={isHost}
              allowFiles={roomSettings.allowFiles}
              onPickFile={handlePickFile}
              onRemoveFile={() => {
                if (activeSharedFile) handleRemoveFile(activeSharedFile.id);
              }}
            />
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
        showShrinkToggle={showShrinkToggle}
        isShrunk={isScreenShrunk}
        onToggleShrink={() => setIsScreenShrunk(!isScreenShrunk)}
      />

      {/* ─── Collapsible Bottom Bar with Chat ─── */}
      <RoomBottomBar
        roomId={roomId}
        roomName={room?.name || 'Çalışma Odası'}
        inviteCode={room?.inviteCode || ''}
        isLive={true}
        isHost={isHost}
        participants={participants}
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
