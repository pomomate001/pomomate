/**
 * Kök gezinme yapısı.
 *
 * Kullanıcı oturum açmışsa alt sekmeler gösterilir,
 * oturum yoksa kimlik doğrulama akışı gösterilir.
 */
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../ui/theme';
import { TimerStack, StatsStack, RoomStack, ProfileStack } from './stacks';
import { AuthNavigator } from './AuthNavigator';
import { UpdatePasswordModal } from '../ui/screens/auth';
import type { RootTabParamList } from './types';
import { useUserStore } from '../state';
import { authService, supabase } from '../services/auth';
import { useTranslation } from '../i18n';

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons: Record<keyof RootTabParamList, { active: string; inactive: string }> = {
  TimerTab: { active: 'timer', inactive: 'timer-outline' },
  StatsTab: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  RoomTab: { active: 'people', inactive: 'people-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

function MainTabs() {
  const colors = useColors();
  const { t } = useTranslation();

  const tabLabels: Record<keyof RootTabParamList, string> = {
    TimerTab: t('tabs.timer'),
    StatsTab: t('tabs.stats'),
    RoomTab: t('tabs.room'),
    ProfileTab: t('tabs.profile'),
  };

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

export function RootNavigator() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    };

    void hydrateUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <>
      <MainTabs />
      <UpdatePasswordModal />
    </>
  );
}
