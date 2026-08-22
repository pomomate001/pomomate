import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/ui/theme';
import { validateConfig } from './src/config';
import { notificationService } from './src/services/mobile';
import { useTimerStore } from './src/state';

// Warn (dev only) about any missing env configuration at startup.
validateConfig();

export default function App() {
  const isTimerRunning = useTimerStore((s) => s.isRunning);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();
  }, []);

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
