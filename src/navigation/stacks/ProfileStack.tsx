import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ProfileScreen,
  AppearanceSettings,
  TimerSettings,
  SoundSettings,
} from '../../ui/screens/profile';
import type { ProfileStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileHomeWrapper({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>) {
  return (
    <ProfileScreen
      onNavigateAppearance={() => navigation.navigate('SettingsAppearance')}
      onNavigateTimer={() => navigation.navigate('SettingsTimer')}
      onNavigateSounds={() => navigation.navigate('SettingsSounds')}
    />
  );
}

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileHomeWrapper} options={{ title: 'Profil', headerShown: false }} />
      <Stack.Screen name="SettingsAppearance" component={AppearanceSettings} options={{ title: 'Görünüm' }} />
      <Stack.Screen name="SettingsTimer" component={TimerSettings} options={{ title: 'Süre Ayarları' }} />
      <Stack.Screen name="SettingsSounds" component={SoundSettings} options={{ title: 'Sesler' }} />
    </Stack.Navigator>
  );
}
