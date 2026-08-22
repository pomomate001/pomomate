import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatsScreen } from '../../ui/screens/stats';
import type { StatsStackParamList } from '../types';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export function StatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsHome" component={StatsScreen} />
    </Stack.Navigator>
  );
}
