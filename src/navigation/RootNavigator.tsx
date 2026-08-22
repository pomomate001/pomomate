/**
 * Root navigator.
 *
 * Defines the app's native stack navigator using the typed RootStackParamList.
 * Screens are placeholders (M02 implements the real ones). This file wires the
 * navigation graph together and is rendered inside NavigationContainer by
 * AppNavigator.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  RoomScreen,
  SettingsScreen,
  TasksScreen,
  TimerScreen,
} from './screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
