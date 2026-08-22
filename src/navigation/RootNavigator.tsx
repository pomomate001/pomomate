/**
 * Root tab navigator — 4 bottom tabs.
 *
 * Sayaç | İstatistik | Çalışma Odası | Profil
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../ui/theme';
import { TimerStack, StatsStack, RoomStack, ProfileStack } from './stacks';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons: Record<keyof RootTabParamList, { active: string; inactive: string }> = {
  TimerTab: { active: 'timer', inactive: 'timer-outline' },
  StatsTab: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  RoomTab: { active: 'people', inactive: 'people-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const tabLabels: Record<keyof RootTabParamList, string> = {
  TimerTab: 'Sayaç',
  StatsTab: 'İstatistik',
  RoomTab: 'Çalışma Odası',
  ProfileTab: 'Profil',
};

export function RootNavigator() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          );
        },
        tabBarLabel: tabLabels[route.name],
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: { backgroundColor: colors.tabBarBackground, borderTopColor: colors.divider },
      })}
    >
      <Tab.Screen name="TimerTab" component={TimerStack} />
      <Tab.Screen name="StatsTab" component={StatsStack} />
      <Tab.Screen name="RoomTab" component={RoomStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
