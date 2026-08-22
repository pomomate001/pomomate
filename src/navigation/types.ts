/**
 * Navigation type definitions.
 *
 * Bottom tabs: Sayaç, İstatistik, Çalışma Odası, Profil
 * Each tab may have its own nested stack.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/* ─── Tab param lists ─── */

export type TimerStackParamList = {
  TimerHome: undefined;
};

export type StatsStackParamList = {
  StatsHome: undefined;
  FriendDetail: { userId: string };
};

export type RoomStackParamList = {
  RoomList: undefined;
  RoomCreate: undefined;
  RoomJoin: undefined;
  RoomActive: { roomId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  SettingsAppearance: undefined;
  SettingsTimer: undefined;
  SettingsSounds: undefined;
};

/* ─── Root tab param list ─── */

export type RootTabParamList = {
  TimerTab: NavigatorScreenParams<TimerStackParamList>;
  StatsTab: NavigatorScreenParams<StatsStackParamList>;
  RoomTab: NavigatorScreenParams<RoomStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/* ─── Screen-level prop helpers ─── */

export type TabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;

export type TimerStackScreenProps<T extends keyof TimerStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<TimerStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type StatsStackScreenProps<T extends keyof StatsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<StatsStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type RoomStackScreenProps<T extends keyof RoomStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<RoomStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

/** Global navigation typing. */
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootTabParamList {}
  }
}
