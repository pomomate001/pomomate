import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoomListScreen, RoomActiveScreen, RoomCreateSheet, RoomJoinSheet } from '../../ui/screens/room';
import type { RoomStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RoomStackParamList>();

function RoomListWrapper({ navigation }: NativeStackScreenProps<RoomStackParamList, 'RoomList'>) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <>
      <RoomListScreen
        onCreateRoom={() => setShowCreate(true)}
        onJoinRoom={() => setShowJoin(true)}
        onEnterRoom={(roomId) => navigation.navigate('RoomActive', { roomId })}
      />
      <RoomCreateSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(name) => {
          setShowCreate(false);
          navigation.navigate('RoomActive', { roomId: `room-${Date.now()}` });
        }}
      />
      <RoomJoinSheet
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onJoin={(code) => {
          setShowJoin(false);
          navigation.navigate('RoomActive', { roomId: code });
        }}
      />
    </>
  );
}

function RoomActiveWrapper({ route, navigation }: NativeStackScreenProps<RoomStackParamList, 'RoomActive'>) {
  return (
    <RoomActiveScreen
      roomId={route.params.roomId}
      onLeave={() => navigation.goBack()}
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
