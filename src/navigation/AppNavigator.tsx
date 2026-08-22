/**
 * App navigator entry point.
 *
 * Wraps the RootNavigator in a NavigationContainer. This is the single
 * component the app root (App.tsx) renders to boot navigation.
 */
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
