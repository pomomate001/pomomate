// Global Jest Setup and Mocks
process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fake-supabase-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'fake-anon-key';

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'tr', regionCode: 'TR' }],
  getCalendars: () => [{ timeZone: 'Europe/Istanbul' }],
}));

jest.mock('react-native', () => {
  const listeners = new Map();
  return {
    Platform: { OS: 'ios', select: (obj) => obj.android || obj.ios || obj.default },
    NativeModules: {},
    DeviceEventEmitter: {
      addListener: jest.fn((event, callback) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(callback);
        return {
          remove: jest.fn(() => {
            listeners.get(event)?.delete(callback);
          }),
        };
      }),
      emit: jest.fn((event, ...args) => {
        listeners.get(event)?.forEach((cb) => cb(...args));
      }),
      removeAllListeners: jest.fn((event) => {
        if (event) listeners.delete(event);
        else listeners.clear();
      }),
    },
    Linking: {
      canOpenURL: jest.fn(),
      openURL: jest.fn(),
    },
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
    clear: jest.fn(async () => {}),
  },
}));
