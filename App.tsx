import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/ui/theme';
import { validateConfig } from './src/config';

// Warn (dev only) about any missing env configuration at startup.
validateConfig();

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
