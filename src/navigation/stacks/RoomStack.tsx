import React, { useState } from 'react';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoomListScreen, RoomActiveScreen, RoomCreateSheet, RoomJoinSheet } from '../../ui/screens/room';
import { PremiumPaywallSheet } from '../../ui/screens/profile/PremiumPaywallSheet';
import { useRoomStore, useUserStore, useSettingsStore } from '../../state';
import { roomService } from '../../services/room';
import type { RoomStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RoomStackParamList>();

function RoomListWrapper({ navigation }: NativeStackScreenProps<RoomStackParamList, 'RoomList'>) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const addRoom = useRoomStore((s) => s.addRoom);
  const setRoomActive = useRoomStore((s) => s.setRoomActive);
  const setCurrentRoom = useRoomStore((s) => s.setCurrentRoom);
  const rooms = useRoomStore((s) => s.rooms);
  const user = useUserStore((s) => s.user);
  const isPremium = useSettingsStore((s) => s.isPremium);

  const handleCreateRoom = async (name: string) => {
    setShowCreate(false);
    const hostId = user?.id || 'host';
    const { room, error } = await roomService.createRoom(name, hostId);
    if (error || !room) {
      Alert.alert('Hata', error || 'Oda oluşturulamadı.');
      return;
    }
    addRoom(room);
    setCurrentRoom(room);
    navigation.navigate('RoomActive', { roomId: room.id });
  };

  const handleJoinRoom = async (code: string) => {
    setShowJoin(false);
    const userId = user?.id || 'user';
    const { room, error } = await roomService.joinRoom(code, userId);
    if (error || !room) {
      Alert.alert('Oda Bulunamadı', error || 'Bu koda sahip aktif bir çalışma odası bulunamadı.');
      return;
    }
    addRoom(room);
    setCurrentRoom(room);
    navigation.navigate('RoomActive', { roomId: room.id });
  };

  const handleEnterRoom = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom) {
      // If user is host, re-activate the room
      const isHost = targetRoom.hostId === (user?.id ?? 'host');
      if (isHost) {
        setRoomActive(roomId, true);
        setCurrentRoom({ ...targetRoom, isActive: true });
      } else {
        setCurrentRoom(targetRoom);
      }
    }
    navigation.navigate('RoomActive', { roomId });
  };

  return (
    <>
      <RoomListScreen
        onCreateRoom={() => {
          if (!isPremium) {
            setShowPaywall(true);
          } else {
            setShowCreate(true);
          }
        }}
        onJoinRoom={() => setShowJoin(true)}
        onEnterRoom={handleEnterRoom}
      />
      <RoomCreateSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateRoom}
      />
      <RoomJoinSheet
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onJoin={handleJoinRoom}
      />
      <PremiumPaywallSheet
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}

function RoomActiveWrapper({ route, navigation }: NativeStackScreenProps<RoomStackParamList, 'RoomActive'>) {
  const leave = useRoomStore((s) => s.leave);

  const handleLeave = () => {
    leave();
    navigation.goBack();
  };

  return (
    <RoomActiveScreen
      roomId={route.params.roomId}
      onLeave={handleLeave}
    />
  );
}

export function RoomStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomList" component={RoomListWrapper} />
      <Stack.Screen name="RoomActive" component={RoomActiveWrapper} />
    </Stack.Navigator>
  );
}
