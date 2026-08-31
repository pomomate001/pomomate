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
        
        // The URL might have tokens in query params or fragment
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
          const parsed = Linking.parse(url);
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

      const initialUrl = await Linking.getInitialURL();
      await handleDeepLink(initialUrl);

      const urlSub = Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url).then(async () => {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            useUserStore.getState().setUser(currentUser);
          }
        });
      });

      // Load current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        useUserStore.getState().setUser(currentUser);

        // Initialize RevenueCat
        await revenueCatService.initialize(currentUser.id);

        // Check subscription status
        const tier = await revenueCatService.checkSubscription();
        setIsPremium(tier === 'premium');

        // Generate recurring tasks for today
        useTaskStore.getState().generateRecurringTasks();
      }
      
      return urlSub;
    };

    let urlSub: { remove: () => void } | null = null;
    
    // Patch init to capture urlSub and hide splash screen when ready
    const startInit = async () => {
      try {
        urlSub = await init();
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    
    startInit();

    return () => {
      if (urlSub) urlSub.remove();
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
