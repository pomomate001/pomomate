import { useEffect } from 'react';
import { Alert, Platform, AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Linking from 'expo-linking';
import { supabase } from './src/services/auth/supabaseClient';
import { AppNavigator, navigationRef } from './src/navigation';
import { ThemeProvider } from './src/ui/theme';
import { validateConfig } from './src/config';
import { notificationService } from './src/services/mobile';
import { adMobService, revenueCatService, referralService } from './src/services/monetization';
import { authService } from './src/services/auth';
import { friendService } from './src/services/friends/FriendService';
import { roomService, roomInviteService } from './src/services/room';
import { pipService } from './src/services/mobile/pip/PiPService';
import { useTimerStore, useUserStore, useSettingsStore, useTaskStore, useRoomStore, usePiPStore } from './src/state';
import { JoinLandingScreen } from './src/ui/screens/JoinLandingScreen';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while services and auth initialize (mobile only)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
  SplashScreen.setOptions({
    duration: 400,
    fade: true,
  });
}

WebBrowser.maybeCompleteAuthSession();

// Warn (dev only) about any missing env configuration at startup.
validateConfig();

export default function App() {
  const isTimerRunning = useTimerStore((s) => s.isRunning);
  const setIsPremium = useSettingsStore((s) => s.setIsPremium);

  useEffect(() => {
    // Initialize services
    const init = async () => {
      await notificationService.initialize();
      await adMobService.initialize();

      const handleDeepLink = async (url: string | null) => {
        if (!url) return;
        
        // Check for PKCE flow (auth code)
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string;
        
        // If the URL is specifically for password reset or has type=recovery
        if (
          url.includes('reset-password') || 
          parsed.queryParams?.type === 'recovery'
        ) {
          useUserStore.getState().setNeedsPasswordReset(true);
        }

        if (code) {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            // The session is now established automatically
          } catch (err) {
            console.error('[App] Failed to exchange code for session:', err);
          }
          return;
        }

        // Fallback for Implicit flow (legacy)
        let accessToken = '';
        let refreshToken = '';
        let type = '';
        
        if (url.includes('#')) {
          const fragment = url.split('#')[1];
          const parts = fragment.split('&');
          parts.forEach(p => {
            const [k, v] = p.split('=');
            if (k === 'access_token') accessToken = v;
            if (k === 'refresh_token') refreshToken = v;
            if (k === 'type') type = v;
          });
        }
        
        if (!accessToken) {
          accessToken = parsed.queryParams?.access_token as string;
          refreshToken = parsed.queryParams?.refresh_token as string;
          type = parsed.queryParams?.type as string;
        }

        if (type === 'recovery') {
          useUserStore.getState().setNeedsPasswordReset(true);
        }

        const roomCode = parsed.queryParams?.room as string;
        if (roomCode) {
          const user = useUserStore.getState().user;
          roomService.joinRoom(roomCode, user?.id || 'guest').then(({ room, error }) => {
            if (room) {
              useRoomStore.getState().addRoom(room);
              useRoomStore.getState().setCurrentRoom(room);
              if (navigationRef.isReady()) {
                navigationRef.navigate('RoomTab', {
                  screen: 'RoomActive',
                  params: { roomId: room.id },
                });
              }
            } else if (error) {
              Alert.alert('Oda Bulunamadı', error);
            }
          });
        }

        const friendCode = parsed.queryParams?.friend as string;
        if (friendCode) {
          const user = useUserStore.getState().user;
          if (user?.id && user.id !== friendCode) {
            friendService.sendFriendRequest(user.id, friendCode).then((res) => {
              if (res.success) {
                Alert.alert('Arkadaşlık İsteği Gönderildi 🤝', res.message);
              }
            });
          }
        }

        const refCode = parsed.queryParams?.ref as string;
        if (refCode) {
          await referralService.savePendingCode(refCode);
          const user = useUserStore.getState().user;
          if (user?.id) {
            referralService.consumePendingCodeIfAny().then((applyRes) => {
              if (applyRes?.success) {
                Alert.alert(
                  'Davet Kodu Uygulandı! 🎁',
                  `${applyRes.referrerName || 'Arkadaşın'} seni PomoMate'e davet etti!`
                );
              }
            });
          }
        }
        
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      };

      let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

      const setupUserSubscription = async (currentUser: any) => {
        useUserStore.getState().setUser(currentUser);

        // Listen for real-time room invitations
        roomInviteService.listenForInvites(currentUser.id, (invite) => {
          Alert.alert(
            'Çalışma Odası Daveti 🎯',
            `${invite.senderName} seni "${invite.roomName}" çalışma odasına davet etti!\n\nOda Kodu: ${invite.inviteCode}`,
            [
              { text: 'Daha Sonra', style: 'cancel' },
              {
                text: 'Odaya Katıl',
                onPress: async () => {
                  const { room, error } = await roomService.joinRoom(invite.inviteCode, currentUser.id);
                  if (error || !room) {
                    Alert.alert('Oda Bulunamadı', error || 'Bu odaya bağlanılamadı.');
                    return;
                  }
                  useRoomStore.getState().addRoom(room);
                  useRoomStore.getState().setCurrentRoom(room);
                  if (navigationRef.isReady()) {
                    navigationRef.navigate('RoomTab', {
                      screen: 'RoomActive',
                      params: { roomId: room.id },
                    });
                  }
                },
              },
            ]
          );
        });

        // Consume any pending referral code (e.g. from deep link or registration)
        referralService.consumePendingCodeIfAny().then((applyRes) => {
          if (applyRes?.success) {
            Alert.alert(
              'Davet Kodu Uygulandı! 🎁',
              `${applyRes.referrerName || 'Arkadaşın'} seni PomoMate'e davet etti!`
            );
          }
        });

        const verifySubscription = async (userToVerify?: any) => {
          const u = userToVerify || useUserStore.getState().user;
          if (!u?.id) return;

          const rcTier = await revenueCatService.checkSubscription();
          const isPro = revenueCatService.isUserPro(u, rcTier);

          if (isPro) {
            setIsPremium(true);
            if (rcTier === 'premium' && u.subscriptionTier !== 'premium') {
              await revenueCatService.syncSupabaseTier(u.id, 'premium');
              useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
            }
          } else {
            setIsPremium(false);
            useSettingsStore.getState().revertToFreeDefaults();
            if (u.subscriptionTier === 'premium') {
              await revenueCatService.syncSupabaseTier(u.id, 'free');
              useUserStore.getState().updateUser({ subscriptionTier: 'free' });
            }
          }
        };

        // Initialize RevenueCat
        await revenueCatService.initialize(currentUser.id);

        // Run initial verification
        await verifySubscription(currentUser);

        // Listen for live RevenueCat updates (e.g. promotional grants, store renewals, expirations)
        await revenueCatService.onCustomerInfoUpdate((customerInfo) => {
          const isEntitled = revenueCatService.checkEntitlement(customerInfo);
          const currentU = useUserStore.getState().user;
          const isPro = revenueCatService.isUserPro(
            currentU,
            isEntitled ? 'premium' : 'free'
          );

          if (isPro) {
            setIsPremium(true);
            if (currentU && currentU.subscriptionTier !== 'premium') {
              revenueCatService.syncSupabaseTier(currentU.id, 'premium');
              useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
            }
          } else {
            setIsPremium(false);
            useSettingsStore.getState().revertToFreeDefaults();
            if (currentU && currentU.subscriptionTier === 'premium') {
              revenueCatService.syncSupabaseTier(currentU.id, 'free');
              useUserStore.getState().updateUser({ subscriptionTier: 'free' });
            }
          }
        });

        // Supabase Realtime listener for user profile / subscription_tier changes
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
        }
        realtimeChannel = supabase
          .channel(`user-sync-${currentUser.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${currentUser.id}`,
            },
            (payload) => {
              const updated = payload.new as any;
              if (updated && updated.subscription_tier) {
                const newTier = updated.subscription_tier as 'free' | 'premium';
                useUserStore.getState().updateUser({ subscriptionTier: newTier });
                if (newTier === 'premium') {
                  setIsPremium(true);
                } else {
                  // If revoked in Supabase, verify if an active Store subscription exists
                  revenueCatService.checkSubscription().then((tier) => {
                    setIsPremium(tier === 'premium');
                  });
                }
              }
            }
          )
          .subscribe();

        // Generate recurring tasks for today
        useTaskStore.getState().generateRecurringTasks();
      };

      const initialUrl = await Linking.getInitialURL();
      await handleDeepLink(initialUrl);

      const urlSub = Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url).then(async () => {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            await setupUserSubscription(currentUser);
          }
        });
      });

      // Load current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        await setupUserSubscription(currentUser);
      }
      
      const appStateSub = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          const currentU = useUserStore.getState().user;
          if (currentU?.id) {
            revenueCatService.checkSubscription().then((rcTier) => {
              const isPro = revenueCatService.isUserPro(currentU, rcTier);
              if (isPro) {
                setIsPremium(true);
                if (rcTier === 'premium' && currentU.subscriptionTier !== 'premium') {
                  revenueCatService.syncSupabaseTier(currentU.id, 'premium');
                  useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
                }
              } else {
                setIsPremium(false);
                useSettingsStore.getState().revertToFreeDefaults();
                if (currentU.subscriptionTier === 'premium') {
                  revenueCatService.syncSupabaseTier(currentU.id, 'free');
                  useUserStore.getState().updateUser({ subscriptionTier: 'free' });
                }
              }
            });
          }
        }
      });

      return { urlSub, realtimeChannel, appStateSub };
    };

    let cleanupRefs: {
      urlSub?: { remove: () => void };
      appStateSub?: { remove: () => void };
      realtimeChannel?: ReturnType<typeof supabase.channel> | null;
    } | null = null;
    
    // Patch init to capture cleanup refs and hide splash screen when ready
    const startInit = async () => {
      try {
        cleanupRefs = await init();
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        if (Platform.OS !== 'web') {
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    };
    
    startInit();

    return () => {
      if (cleanupRefs?.urlSub) cleanupRefs.urlSub.remove();
      if (cleanupRefs?.appStateSub) cleanupRefs.appStateSub.remove();
      if (cleanupRefs?.realtimeChannel) {
        supabase.removeChannel(cleanupRefs.realtimeChannel);
      }
    };
  }, [setIsPremium]);

  // Keep screen awake when timer is running
  useEffect(() => {
    if (isTimerRunning) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
  }, [isTimerRunning]);

  // Sync native PiP state to global store
  useEffect(() => {
    const unsub = pipService.addPiPListener((inPiP) => {
      usePiPStore.getState().setIsInPiP(inPiP);
    });
    return () => unsub();
  }, []);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname.startsWith('/join')) {
    return <JoinLandingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
