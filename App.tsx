import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Linking from 'expo-linking';
import { supabase } from './src/services/auth/supabaseClient';
import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/ui/theme';
import { validateConfig } from './src/config';
import { notificationService } from './src/services/mobile';
import { adMobService, revenueCatService } from './src/services/monetization';
import { authService } from './src/services/auth';
import { useTimerStore, useUserStore, useSettingsStore, useTaskStore } from './src/state';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while services and auth initialize
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

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

        // Initialize RevenueCat
        await revenueCatService.initialize(currentUser.id);

        // Check subscription status from RevenueCat and Supabase
        const rcTier = await revenueCatService.checkSubscription();
        const isPro = currentUser.subscriptionTier === 'premium' || rcTier === 'premium';
        setIsPremium(isPro);

        // If RevenueCat is premium but Supabase record is free, sync to Supabase
        if (rcTier === 'premium' && currentUser.subscriptionTier !== 'premium') {
          await revenueCatService.syncSupabaseTier(currentUser.id, 'premium');
          useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
        }

        // Listen for live RevenueCat updates (e.g. promotional grants, store renewals)
        await revenueCatService.onCustomerInfoUpdate((customerInfo) => {
          const isEntitled = revenueCatService.checkEntitlement(customerInfo);
          const currentSupabaseTier = useUserStore.getState().user?.subscriptionTier;
          if (isEntitled) {
            setIsPremium(true);
            if (currentSupabaseTier !== 'premium') {
              revenueCatService.syncSupabaseTier(currentUser.id, 'premium');
              useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
            }
          } else if (currentSupabaseTier !== 'premium') {
            setIsPremium(false);
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
      
      return { urlSub, realtimeChannel };
    };

    let cleanupRefs: { urlSub?: { remove: () => void }; realtimeChannel?: ReturnType<typeof supabase.channel> | null } | null = null;
    
    // Patch init to capture cleanup refs and hide splash screen when ready
    const startInit = async () => {
      try {
        cleanupRefs = await init();
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    
    startInit();

    return () => {
      if (cleanupRefs?.urlSub) cleanupRefs.urlSub.remove();
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
