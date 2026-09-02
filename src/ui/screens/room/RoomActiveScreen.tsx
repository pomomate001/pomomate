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
import { useRoomStore, useUserStore, useTaskStore } from '../../../state';
import { mediaService } from '../../../services/mobile/media/MediaService';
import { permissionManager } from '../../../services/mobile/permissions/PermissionManager';
import { pipService } from '../../../services/mobile/pip/PiPService';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';
import { useTranslation } from '../../../i18n';
import { RoomClient } from '../../../services/webrtc/RoomClient';
import { supabase } from '../../../services/auth/supabaseClient';
import { roomService } from '../../../services/room';

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
  const [remoteScreenSharer, setRemoteScreenSharer] = useState<{ userId: string; userName: string } | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isScreenShrunk, setIsScreenShrunk] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);

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
      Alert.alert('Mini Mod Desteklenmiyor', 'Cihazınız Picture-in-Picture (Mini Mod) özelliğini desteklemiyor.');
      return;
    }
    const success = await pipService.enterPiP();
    if (!success) {
      Alert.alert(
        'Mini Mod Başlatılamadı',
        'Lütfen telefonunuzun Ayarlar > Uygulamalar > PomoMate > Resim İçinde Resim (PiP) izninin açık olduğundan emin olun.'
      );
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

    const cleanupState = client.onPeerStateChange((peerId: string, state) => {
      if (state === 'disconnected' || state === 'failed') {
        setRemoteStreams((prev) => {
          if (!prev[peerId]) return prev;
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
        setRemoteScreenSharer((prev) => (prev?.userId === peerId ? null : prev));
      }
    });
    
    return () => {
      cleanupStream();
      cleanupState();
      mediaService.stopUserMedia();
      client.disconnect();
      roomClientRef.current = null;
      setRemoteStreams({});
      if (user?.id) {
        void roomService.leaveRoom(roomId, user.id, isHost);
      }
    };
  }, [roomId, user, room?.hostId, isHost]);

  // Synchronize room permissions from database and real-time host updates
  useEffect(() => {
    if (!roomId) return;

    // Fetch persisted room settings
    void roomService.getRoomSettings(roomId).then((settings) => {
      if (settings) {
        useRoomStore.getState().setRoomSettings(settings);
      }
    });

    // Listen for live permission updates from admin
    const channel = supabase.channel(`room_settings_${roomId}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'settings_update' }, ({ payload }) => {
        if (payload) {
          useRoomStore.getState().setRoomSettings(payload);

          if (!isHost) {
            if (payload.allowMic === false && micOn) {
              if (camOn) {
                if (roomClientRef.current) {
                  void roomClientRef.current.enableAudioVideo(false, true);
                } else {
                  void mediaService.getUserMedia({ audio: false, video: true });
                }
              } else {
                if (roomClientRef.current) {
                  roomClientRef.current.stopMedia();
                } else {
                  mediaService.stopUserMedia();
                }
                setLocalStream(null);
              }
              setMicOn(false);
              Alert.alert('Yetki Güncellendi', 'Oda yöneticisi mikrofon kullanımını kapattı.');
            }

            if (payload.allowCamera === false && camOn) {
              if (micOn) {
                if (roomClientRef.current) {
                  void roomClientRef.current.enableAudioVideo(true, false);
                } else {
                  void mediaService.getUserMedia({ audio: true, video: false });
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
              Alert.alert('Yetki Güncellendi', 'Oda yöneticisi kamera kullanımını kapattı.');
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, isHost, micOn, camOn]);

  // Synchronize screen share status across all room participants
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`room_screen_${roomId}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'screen_share_status' }, ({ payload }) => {
        if (payload) {
          if (payload.isSharing && payload.userId !== user?.id) {
            setRemoteScreenSharer({
              userId: payload.userId,
              userName: payload.userName || 'Katılımcı',
            });
            // Auto open the large presentation panel for viewers
            if (!viewToggles.screen) {
              toggleView('screen');
            }
          } else if (!payload.isSharing && payload.userId !== user?.id) {
            setRemoteScreenSharer((prev) => (prev?.userId === payload.userId ? null : prev));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id, viewToggles.screen, toggleView]);

  const activeScreenStream = screenShareOn
    ? screenStream
    : remoteScreenSharer
    ? remoteStreams[remoteScreenSharer.userId] || null
    : null;

  const isAnyScreenSharing = screenShareOn || (!!remoteScreenSharer && !!activeScreenStream);

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
    ...members.map((m) => {
      const isPresentingScreen = remoteScreenSharer?.userId === m.userId;
      return {
        userId: m.userId,
        displayName: m.userId.slice(0, 6),
        avatarUrl: undefined,
        hasCamera: !isPresentingScreen && !!remoteStreams[m.userId],
        hasMic: false,
        stream: isPresentingScreen ? null : remoteStreams[m.userId] || null,
        isLocal: false,
      };
    }),
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

          // Broadcast to all participants that host is sharing screen
          const channel = supabase.channel(`room_screen_${roomId}`);
          channel.send({
            type: 'broadcast',
            event: 'screen_share_status',
            payload: {
              userId: user?.id,
              userName: user?.displayName || 'Host',
              isSharing: true,
            },
          });
          
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.onended = () => {
              setScreenShareOn(false);
              setScreenStream(null);
              setIsScreenShrunk(false); // Reset shrink when screen ends
              const ch = supabase.channel(`room_screen_${roomId}`);
              ch.send({
                type: 'broadcast',
                event: 'screen_share_status',
                payload: {
                  userId: user?.id,
                  isSharing: false,
                },
              });
            };
          }
          if (!viewToggles.screen) {
            toggleView('screen');
          }
        } else {
          Alert.alert(t('rooms.screenShareTitle'), t('rooms.screenShareError'));
        }
      } catch {
        Alert.alert(t('rooms.screenShareTitle'), t('rooms.screenShareError'));
      }
    } else {
      if (roomClientRef.current) {
         roomClientRef.current.stopMedia();
      } else {
         mediaService.stopUserMedia();
      }
      setScreenShareOn(false);
      setScreenStream(null);
      setIsScreenShrunk(false);

      const channel = supabase.channel(`room_screen_${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'screen_share_status',
        payload: {
          userId: user?.id,
          isSharing: false,
        },
      });
    }
  }, [screenShareOn, isHost, viewToggles.screen, toggleView, t, roomId, user]);

  /* ─── Share Handler ─── */

  const handleSystemShare = useCallback(async () => {
    try {
      const roomName = room?.name ?? 'PomoMate Çalışma Odası';
      const shareUrl = `https://pomomate.app/join?room=${inviteCode}`;
      const message = `🎯 PomoMate Çalışma Odama Davetlisin!\n\nOda: ${roomName}\nOda Kodu: ${inviteCode}\n\nUygulamadan 'Odaya Katıl' diyerek bu kodu girebilir veya doğrudan bağlantıya tıklayabilirsin:\n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: `${roomName} - PomoMate`,
      });
    } catch {
      // User cancelled share
    }
  }, [room, inviteCode]);

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

  /* ─── PiP Compact View (Mini Floating Bar: Only Mic, Cam, Screen Share) ─── */
  if (isInPiP) {
    return (
      <View style={styles.pipContainer}>
        <View style={styles.pipBar}>
          {/* Left: Room Badge / Live Dot */}
          <View style={styles.pipLiveBadge}>
            <View style={styles.pipLiveDot} />
            <Text style={styles.pipLiveText} numberOfLines={1}>
              {room?.name || 'Canlı Oda'}
            </Text>
          </View>

          {/* Right: Camera, Mic, Screen Share Controls */}
          <View style={styles.pipControls}>
            <Pressable
              style={[styles.pipButton, micOn ? styles.pipBtnActiveGreen : styles.pipBtnInactive]}
              onPress={handleToggleMic}
            >
              <Ionicons name={micOn ? 'mic' : 'mic-off'} size={18} color="#FFF" />
            </Pressable>

            <Pressable
              style={[styles.pipButton, camOn ? styles.pipBtnActiveGreen : styles.pipBtnInactive]}
              onPress={handleToggleCam}
            >
              <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={18} color="#FFF" />
            </Pressable>

            <Pressable
              style={[styles.pipButton, screenShareOn ? styles.pipBtnActivePurple : styles.pipBtnInactive]}
              onPress={handleToggleScreen}
            >
              <Ionicons name={screenShareOn ? 'desktop' : 'desktop-outline'} size={18} color="#FFF" />
            </Pressable>
          </View>
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
        roomId={roomId}
        roomName={room?.name}
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
              isScreenSharing={isAnyScreenSharing}
              screenStream={activeScreenStream}
              presenterName={remoteScreenSharer ? remoteScreenSharer.userName : undefined}
              isHost={isHost}
              allowFiles={roomSettings.allowFiles}
              onPickFile={handlePickFile}
              onRemoveFile={() => {
                if (activeSharedFile) handleRemoveFile(activeSharedFile.id);
              }}
              onEnterPiP={handleEnterPiP}
              onStopScreenShare={screenShareOn ? handleToggleScreen : undefined}
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
    backgroundColor: '#0D0D14',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  pipBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#181824',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    elevation: 8,
  },
  pipLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  pipLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  pipLiveText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pipControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pipButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipBtnActiveGreen: {
    backgroundColor: '#22C55E',
  },
  pipBtnActivePurple: {
    backgroundColor: '#A855F7',
  },
  pipBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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

