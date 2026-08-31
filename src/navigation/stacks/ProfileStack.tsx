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
import { useTranslation } from '../../i18n';

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
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileHomeWrapper} options={{ title: t('profile.title'), headerShown: false }} />
      <Stack.Screen name="SettingsAppearance" component={AppearanceSettings} options={{ title: t('profile.appearance') }} />
      <Stack.Screen name="SettingsTimer" component={TimerSettings} options={{ title: t('profile.timerSettings') }} />
      <Stack.Screen name="SettingsSounds" component={SoundSettings} options={{ title: t('profile.soundSettings') }} />
    </Stack.Navigator>
  );
}
