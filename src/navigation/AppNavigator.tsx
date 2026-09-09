/**
 * App navigator entry point.
 *
 * Wraps the RootNavigator in a NavigationContainer. This is the single
 * component the app root (App.tsx) renders to boot navigation.
 */
import React, { useMemo } from 'react';
import { NavigationContainer, createNavigationContainerRef, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';
import { useTheme } from '../ui/theme';

export const navigationRef = createNavigationContainerRef<any>();

export function AppNavigator() {
  const { theme } = useTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = theme.dark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      dark: theme.dark,
      colors: {
        ...baseTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.error,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
