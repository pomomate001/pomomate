/**
 * Kök gezinme yapısı.
 *
 * Kullanıcı oturum açmışsa alt sekmeler gösterilir,
 * oturum yoksa kimlik doğrulama akışı gösterilir.
 */
import React, { useEffect, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../ui/theme';
import { TimerStack, StatsStack, RoomStack, ProfileStack } from './stacks';
import { AuthNavigator } from './AuthNavigator';
import { UpdatePasswordModal } from '../ui/screens/auth';
import { OnboardingScreen } from '../ui/screens/onboarding';
import type { RootTabParamList } from './types';
import { useUserStore, useFriendsStore, useRoomStore, useSettingsStore, useStatsStore, useTaskStore } from '../state';
import { authService, supabase } from '../services/auth';
import { countryService } from '../services/location/CountryService';
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
  const currentRoom = useRoomStore((s) => s.currentRoom);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const isVisualWallpaper = backgroundEffectId.startsWith('video_') || backgroundEffectId.startsWith('image_');

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
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        const hideTabBar = !!currentRoom || (route.name === 'RoomTab' && routeName === 'RoomActive');

        return {
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
          tabBarStyle: {
            backgroundColor: isVisualWallpaper ? 'rgba(15, 18, 28, 0.72)' : colors.tabBarBackground,
            borderTopColor: isVisualWallpaper ? 'rgba(255, 255, 255, 0.12)' : colors.divider,
            position: isVisualWallpaper ? 'absolute' : undefined,
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            ...(hideTabBar ? { display: 'none' } : {}),
          },
        };
      }}
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

const subscribeToHydration = (callback: () => void) => {
  return useSettingsStore.persist.onFinishHydration(callback);
};
const getHydrationSnapshot = () => useSettingsStore.persist.hasHydrated();

export function RootNavigator() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const hasSeenOnboarding = useSettingsStore((state) => state.hasSeenOnboarding);
  const setHasSeenOnboarding = useSettingsStore((state) => state.setHasSeenOnboarding);

  const hasHydratedSettings = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    () => false
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (isMounted) {
        if (!currentUser) {
          useStatsStore.getState().reset();
          useTaskStore.getState().reset();
          useFriendsStore.getState().reset();
        }
        setUser(currentUser);
        // Auto-detect and save country code for discovery
        if (currentUser?.id) {
          void countryService.detectAndSave(currentUser.id).then((code) => {
            if (code && !currentUser.countryCode && isMounted) {
              setUser({ ...currentUser, countryCode: code });
            }
          });
        }
      }
    };

    void hydrateUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        useStatsStore.getState().reset();
        useTaskStore.getState().reset();
        useFriendsStore.getState().reset();
        return;
      }

      const currentUser = await authService.getCurrentUser();
      const previousUserId = useUserStore.getState().user?.id;
      if (previousUserId && currentUser?.id && previousUserId !== currentUser.id) {
        useStatsStore.getState().reset();
        useTaskStore.getState().reset();
        useFriendsStore.getState().reset();
      }
      setUser(currentUser);
      // Auto-detect and save country code for discovery
      if (currentUser?.id) {
        void countryService.detectAndSave(currentUser.id).then((code) => {
          if (code && !currentUser.countryCode && isMounted) {
            setUser({ ...currentUser, countryCode: code });
          }
        });
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  if (!hasHydratedSettings) {
    return null;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onFinish={() => setHasSeenOnboarding(true)} />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      <UpdatePasswordModal />
    </View>
  );
}
