import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoomListScreen, RoomActiveScreen, RoomCreateSheet, RoomJoinSheet } from '../../ui/screens/room';
import { useRoomStore, useUserStore } from '../../state';
import { nowIso } from '../../utils/datetime';
import type { Room } from '../../types';
import type { RoomStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RoomStackParamList>();

/** Generate a 6-char invite code (excludes confusing chars like O/0/1/I). */
function generateLocalInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function RoomListWrapper({ navigation }: NativeStackScreenProps<RoomStackParamList, 'RoomList'>) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const addRoom = useRoomStore((s) => s.addRoom);
  const setRoomActive = useRoomStore((s) => s.setRoomActive);
  const setCurrentRoom = useRoomStore((s) => s.setCurrentRoom);
  const rooms = useRoomStore((s) => s.rooms);
  const user = useUserStore((s) => s.user);

  const handleCreateRoom = (name: string) => {
    const inviteCode = generateLocalInviteCode();
    const roomId = `room-${inviteCode}`;
    const newRoom: Room = {
      id: roomId,
      name,
      hostId: user?.id ?? 'host',
      maxMembers: 6,
      isActive: true,
      createdAt: nowIso(),
      inviteCode,
    };
    addRoom(newRoom);
    setCurrentRoom(newRoom);
    setShowCreate(false);
    navigation.navigate('RoomActive', { roomId });
  };

  const handleJoinRoom = (code: string) => {
    setShowJoin(false);
    const normalizedCode = code.trim().toUpperCase();

    // Match by id, inviteCode, or last 6 chars of id
    const existing = rooms.find(
      (r) =>
        r.id.toLowerCase() === code.toLowerCase() ||
        r.inviteCode?.toUpperCase() === normalizedCode ||
        r.id.slice(-6).toUpperCase() === normalizedCode,
    );

    if (existing) {
      setCurrentRoom(existing);
      navigation.navigate('RoomActive', { roomId: existing.id });
    } else {
      const joinedRoom: Room = {
        id: `room-${normalizedCode}`,
        name: `Oda ${normalizedCode}`,
        hostId: 'remote-host',
        maxMembers: 6,
        isActive: true,
        createdAt: nowIso(),
        inviteCode: normalizedCode,
      };
      addRoom(joinedRoom);
      setCurrentRoom(joinedRoom);
      navigation.navigate('RoomActive', { roomId: joinedRoom.id });
    }
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
        onCreateRoom={() => setShowCreate(true)}
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
