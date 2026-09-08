import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useSettingsStore, useTimerStore } from '../state';

/**
 * useDeepFocus — suppresses in-app notification presentations
 * when deep focus mode is enabled and the timer is running.
 *
 * This sets the notification handler to silently dismiss incoming
 * notifications while focus mode is active. When focus mode is
 * deactivated or the timer stops, normal notification behavior resumes.
 *
 * Note: This only affects notifications shown by the app (via expo-notifications).
 * System-level DND requires user to manually enable it from device settings.
 */
export function useDeepFocus() {
  const isRunning = useTimerStore((s) => s.isRunning);
  const deepFocusEnabled = useSettingsStore((s) => s.deepFocusEnabled);
  const isActive = isRunning && deepFocusEnabled;
  const previousHandlerRef = useRef<Notifications.NotificationHandler | null>(null);

  useEffect(() => {
    if (isActive) {
      // Save current handler reference for restoration
      // Set handler to suppress all notification presentations
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        }),
      });
    } else {
      // Restore normal notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }, [isActive]);
}
