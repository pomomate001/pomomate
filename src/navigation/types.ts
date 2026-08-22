/**
 * Navigation type definitions.
 *
 * The param lists here are the single source of truth for route names and
 * their params, giving fully-typed navigation across the app. Real screens are
 * implemented in M02; M01 provides the typed skeleton and placeholders.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Timer: undefined;
  Tasks: undefined;
  Room: { roomId?: string } | undefined;
  Settings: undefined;
};

/** Helper for typing a screen component's props by route name. */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Registers the param list globally so `useNavigation()` is typed without
 * passing generics everywhere.
 */
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
