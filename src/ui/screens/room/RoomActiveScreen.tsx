import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Share, Alert, AppState, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MediaStream } from 'react-native-webrtc';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { RoomTimerBar } from './features/RoomTimerBar';
import { RoomCameraGrid } from './features/RoomCameraGrid';
import { RoomScreenPanel } from './features/RoomScreenPanel';
import { RoomViewToggles } from './features/RoomViewToggles';
import { RoomBottomBar } from './RoomBottomBar';
import { RoomInviteSheet } from './RoomInviteSheet';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { useRoomStore, useUserStore, useTaskStore, useTimerStore } from '../../../state';
import { mediaService } from '../../../services/mobile/media/MediaService';
import { permissionManager } from '../../../services/mobile/permissions/PermissionManager';
import { pipService } from '../../../services/mobile/pip/PiPService';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';
import { formatDuration } from '../../../core/pomodoro';
import { useTranslation } from '../../../i18n';
import { RoomClient } from '../../../services/webrtc/RoomClient';

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
  const [showInvite, setShowInvite] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isTimerRunning = useTimerStore((s) => s.isRunning);
  const timerMode = useTimerStore((s) => s.mode);

  // Detect PiP mode changes via native listener & AppState
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const removePiPListener = pipService.addPiPListener((inPiP) => {
      setIsInPiP(inPiP);
    });

    const appStateSub = AppState.addEventListener('change', async () => {
      const inPiP = await pipService.isInPiPMode();
      setIsInPiP(inPiP);
    });

    pipService.setAutoPiPEnabled(true);

    return () => {
      removePiPListener();
      appStateSub.remove();
      pipService.setAutoPiPEnabled(false);
    };
  }, []);



  const handleEnterPiP = useCallback(async () => {
    const supported = await pipService.isPiPSupported();
    if (!supported) {
      setIsInPiP(true);
      return;
    }
    const success = await pipService.enterPiP();
    if (!success) {
      setIsInPiP(true);
    }
  }, []);

  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { t } = useTranslation();

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
  
  const user = useUserStore((s) => s.user);
  const addTask = useTaskStore((s) => s.addTask);

  const isHost = !room?.hostId || room.hostId === (user?.id ?? 'host');
  const inviteCode = room?.inviteCode ?? roomId.slice(-6).toUpperCase();

  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const roomClientRef = React.useRef<RoomClient | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;
    
    const signalingUrl = process.env.EXPO_PUBLIC_WEBRTC_SIGNALING_URL || 'wss://api.pomomate.app/ws/signaling';
    
    const client = new RoomClient({
      signalingUrl,
      token: 'temp-token',
      roomId,
      userId: user.id,
      isHost: !room?.hostId || room.hostId === user.id
    });
    
    roomClientRef.current = client;
    client.connect();
    
    const cleanupStream = client.onRemoteStream((peerId: string, stream: MediaStream) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
    });
    
    return () => {
      cleanupStream();
      client.disconnect();
      roomClientRef.current = null;
    };
  }, [roomId, user, room?.hostId]);

  const participants = [
    {
      userId: user?.id ?? 'my-user',
      displayName: user?.displayName ?? `You (${isHost ? 'Host' : 'Member'})`,
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
      hasCamera: !!remoteStreams[m.userId],
      hasMic: false, // We'd need signaling state to know for sure, but assume false unless speaking
      stream: remoteStreams[m.userId] || null,
      isLocal: false,
    })),
  ];

  /* ─── Media Handlers ─── */

  const handleToggleMic = useCallback(async () => {
    if (!isHost && !roomSettings.allowMic) {
      Alert.alert(t('rooms.noPermissionTitle'), t('rooms.adminDisabledMic'));
      return;
    }

    if (!micOn) {
      let stream = null;
      if (roomClientRef.current) {
        stream = await roomClientRef.current.enableAudioVideo(true, camOn);
      } else {
        stream = await mediaService.getUserMedia({ audio: true, video: camOn });
      }
      
      if (stream) {
        setMicOn(true);
        if (camOn) setLocalStream(stream);
      } else {
        Alert.alert(t('rooms.micPermissionRequired'), t('rooms.micPermissionBody'));
      }
    } else {
      if (camOn) {
        let stream = null;
        if (roomClientRef.current) {
           stream = await roomClientRef.current.enableAudioVideo(false, true);
        } else {
           stream = await mediaService.getUserMedia({ audio: false, video: true });
        }
        if (stream) setLocalStream(stream);
      } else {
        if (roomClientRef.current) {
           roomClientRef.current.stopMedia();
        } else {
           mediaService.stopUserMedia();
        }
        setLocalStream(null);
      }
      setMicOn(false);
    }
  }, [micOn, camOn, isHost, roomSettings.allowMic, t]);

  const handleToggleCam = useCallback(async () => {
    if (!isHost && !roomSettings.allowCamera) {
      Alert.alert(t('rooms.noPermissionTitle'), t('rooms.adminDisabledCam'));
      return;
    }

    if (!camOn) {
      let stream = null;
      if (roomClientRef.current) {
        stream = await roomClientRef.current.enableAudioVideo(micOn, true);
      } else {
        stream = await mediaService.getUserMedia({ audio: micOn, video: true });
      }
      if (stream) {
        setCamOn(true);
        setLocalStream(stream);
        // Auto-open cameras grid if closed
        if (!viewToggles.cameras) {
          toggleView('cameras');
        }
      } else {
        Alert.alert(t('rooms.camPermissionRequired'), t('rooms.camPermissionBody'));
      }
    } else {
      if (micOn) {
        if (roomClientRef.current) {
          await roomClientRef.current.enableAudioVideo(true, false);
        } else {
          await mediaService.getUserMedia({ audio: true, video: false });
        }
      } else {
        if (roomClientRef.current) {
          roomClientRef.current.stopMedia();
        } else {
          mediaService.stopUserMedia();
        }
      }
      setCamOn(false);
      setLocalStream(null);
    }
  }, [camOn, micOn, viewToggles.cameras, toggleView, isHost, roomSettings.allowCamera, t]);

  const handleToggleScreen = useCallback(async () => {
    if (!isHost) {
      Alert.alert(t('rooms.unauthorizedTitle'), t('rooms.onlyHostScreenShare'));
      return;
    }

    if (!screenShareOn) {
      try {
        if (Platform.OS === 'android') {
          // Medya projeksiyonu için Foreground Service gereklidir, bu da bildirim izni ister (Android 13+).
          await permissionManager.requestNotifications();
        }
        
        let stream = null;
        if (roomClientRef.current) {
           stream = await roomClientRef.current.enableScreenShare();
        } else {
           stream = await mediaService.getDisplayMedia();
        }
        
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
          
          // Enter PiP mode automatically upon starting screen share
          const supported = await pipService.isPiPSupported();
          if (supported) {
            await pipService.enterPiP();
          }
        } else {
          Alert.alert(t('rooms.screenShareTitle'), t('rooms.screenShareError'));
        }
      } catch {
        Alert.alert(t('rooms.screenShareTitle'), t('rooms.screenShareError'));
      }
    } else {
      if (roomClientRef.current) {
         roomClientRef.current.stopMedia(); // or separate method if screen is different track
      } else {
         mediaService.stopUserMedia();
      }
      setScreenShareOn(false);
      setScreenStream(null);
      setIsScreenShrunk(false);
    }
  }, [screenShareOn, isHost, viewToggles.screen, toggleView, t]);

  /* ─── Share Handler ─── */

  const handleSystemShare = useCallback(async () => {
    try {
      await Share.share({
        message: t('rooms.shareRoomMessage', {
          name: room?.name ?? t('rooms.defaultRoomName'),
          code: inviteCode,
        }) + `\n\nOdama katılmak için tıkla: pomomate://room/${inviteCode}`,
        title: t('rooms.shareMessageTitle'),
      });
    } catch {
      // User cancelled share
    }
  }, [room, inviteCode, t]);

  /* ─── File Pick Handler ─── */

  const handlePickFile = useCallback(async () => {
    if (!isHost && !roomSettings.allowFiles) {
      Alert.alert(t('rooms.noPermissionTitle'), t('rooms.adminDisabledFiles'));
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
      Alert.alert(t('rooms.filePickTitle'), t('rooms.filePickError'));
    }
  }, [addSharedFile, setActiveSharedFileId, user, viewToggles.screen, toggleView, isHost, roomSettings.allowFiles, t]);

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

  /* ─── PiP Compact View (Dynamic Island Mini Floating Bar) ─── */
  if (isInPiP) {
    const formattedTime = formatDuration(remainingSeconds);
    const modeLabel = timerMode === 'work' ? 'Odak' : timerMode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola';
    const modeColor = timerMode === 'work' ? '#A855F7' : '#22C55E';

    return (
      <View style={styles.pipContainer}>
        <View style={styles.pipHeaderRow}>
          <View style={[styles.pipModeBadge, { backgroundColor: `${modeColor}30`, borderColor: modeColor }]}>
            <View style={[styles.pipDot, { backgroundColor: isTimerRunning ? '#22C55E' : '#EAB308' }]} />
            <Text style={[styles.pipModeText, { color: modeColor }]}>{modeLabel}</Text>
          </View>
          <Text style={styles.pipTimerText}>{formattedTime}</Text>
        </View>

        <View style={styles.pipControls}>
          <Pressable
            style={[styles.pipButton, micOn && styles.pipButtonActive]}
            onPress={handleToggleMic}
          >
            <Ionicons name={micOn ? 'mic' : 'mic-off'} size={18} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.pipButton, camOn && styles.pipButtonActive]}
            onPress={handleToggleCam}
          >
            <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={18} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.pipButton, screenShareOn && { backgroundColor: '#A855F7' }]}
            onPress={handleToggleScreen}
          >
            <Ionicons name={screenShareOn ? 'desktop' : 'desktop-outline'} size={18} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.pipButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => setIsInPiP(false)}
          >
            <Ionicons name="expand" size={18} color="#FFF" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Task Creation Sheet for Room */}
      <AddTaskSheet
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
      />

      <RoomInviteSheet
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        onSystemShare={handleSystemShare}
        inviteCode={inviteCode}
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
              {t('rooms.toggleHelpText')}
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
              onEnterPiP={handleEnterPiP}
              onStopScreenShare={handleToggleScreen}
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
        onEnterPiP={handleEnterPiP}
      />

      {/* ─── Mini Mod (PiP) Floating Button — only when screen sharing ─── */}
      {screenShareOn && (
        <Pressable
          style={styles.miniModButton}
          onPress={handleEnterPiP}
        >
          <Ionicons name="contract-outline" size={18} color="#FFF" />
          <Text style={styles.miniModText}>Mini Mod</Text>
        </Pressable>
      )}

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
        onShare={() => setShowInvite(true)}
        onLeave={onLeave}
        onPickFile={handlePickFile}
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
  },
  /* ─── PiP compact view styles ─── */
  pipContainer: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  pipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pipModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  pipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pipModeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pipTimerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pipControls: {
    flexDirection: 'row',
    gap: 10,
  },
  pipButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipButtonActive: {
    backgroundColor: '#22C55E',
  },
  /* ─── Mini Mod floating button ─── */
  miniModButton: {
    position: 'absolute',
    left: 16,
    top: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(147, 51, 234, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  miniModText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

