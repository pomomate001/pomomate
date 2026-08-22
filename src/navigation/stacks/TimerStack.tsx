import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TimerScreen } from '../../ui/screens/timer';
import type { TimerStackParamList } from '../types';

const Stack = createNativeStackNavigator<TimerStackParamList>();

export function TimerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimerHome" component={TimerHomeWrapper} />
    </Stack.Navigator>
  );
}

/** Combines timer + task list on the same tab. */
function TimerHomeWrapper() {
  return <TimerScreen />;
}
