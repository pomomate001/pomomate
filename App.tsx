import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/ui/theme';
import { validateConfig } from './src/config';
import { notificationService } from './src/services/mobile';
import { adMobService, revenueCatService } from './src/services/monetization';
import { authService } from './src/services/auth';
import { useTimerStore, useUserStore, useSettingsStore, useTaskStore } from './src/state';

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
    };

    init();
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
    <ThemeProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
