/**
 * Navigation type definitions.
 *
 * Alt sekmeler: Sayaç, İstatistik, Çalışma Odası, Profil
 * Kimlik doğrulama: Giriş, Kayıt
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/* ─── Tab param listeleri ─── */

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
  TagSelection: undefined;
  UserProfile: { userId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/* ─── Root tab param listesi ─── */

export type RootTabParamList = {
  TimerTab: NavigatorScreenParams<TimerStackParamList>;
  StatsTab: NavigatorScreenParams<StatsStackParamList>;
  RoomTab: NavigatorScreenParams<RoomStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/* ─── Ekran tip yardımcıları ─── */

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

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

/** Global navigation typing. */
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootTabParamList {}
  }
}
