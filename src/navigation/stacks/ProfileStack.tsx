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
import { useColors } from '../../ui/theme';

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
  const colors = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: 17,
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileHomeWrapper} options={{ title: t('profile.title'), headerShown: false }} />
      <Stack.Screen name="SettingsAppearance" component={AppearanceSettings} options={{ title: t('profile.appearance') }} />
      <Stack.Screen name="SettingsTimer" component={TimerSettings} options={{ title: t('profile.timerSettings') }} />
      <Stack.Screen name="SettingsSounds" component={SoundSettings} options={{ title: t('profile.soundSettings') }} />
    </Stack.Navigator>
  );
}
