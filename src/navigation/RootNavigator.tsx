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
import { useUserStore, useFriendsStore, usePiPStore } from '../state';
import { authService, supabase } from '../services/auth';
import { countryService } from '../services/location/CountryService';
import { PiPFloatingBar } from '../ui/screens/pip/PiPFloatingBar';
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

  const user = useUserStore((s) => s.user);
  const incomingRequests = useFriendsStore((s) => s.incomingRequests);

  useEffect(() => {
    if (user?.id) {
      // Background fetch for badges
      import('../services/friends/FriendService').then(({ friendService }) => {
        friendService.fetchIncomingRequests(user.id);
      });
    }
  }, [user?.id]);

  const reqCount = incomingRequests.length;

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
      <Tab.Screen 
        name="StatsTab" 
        component={StatsStack}
        options={{
          tabBarBadge: reqCount > 0 ? reqCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, color: '#FFF' },
        }} 
      />
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
        // Auto-detect and save country code for discovery
        if (currentUser?.id) {
          void countryService.detectAndSave(currentUser.id);
        }
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
      // Auto-detect and save country code for discovery
      if (currentUser?.id) {
        void countryService.detectAndSave(currentUser.id);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  const isInPiP = usePiPStore((state) => state.isInPiP);

  if (isInPiP) {
    return <PiPFloatingBar />;
  }

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
