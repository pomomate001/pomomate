/**
 * Notification service — local and push notifications.
 * 
 * Handles Pomodoro timer completion notifications and future push notifications.
 */
import * as Notifications from 'expo-notifications';
import { logger } from '../../../utils/logger';
import { permissionManager } from '../permissions/PermissionManager';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private expoPushToken: string | null = null;

  /* ─── Initialization ─── */

  async initialize(): Promise<void> {
    const perm = await permissionManager.requestNotifications();
    if (perm.status !== 'granted') {
      logger.warn('[Notifications] Permission denied');
      return;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = token.data;
      logger.info('[Notifications] Push token:', this.expoPushToken);
    } catch (err) {
      logger.warn('[Notifications] Failed to get push token:', err);
    }
  }

  /* ─── Local Notifications ─── */

  async scheduleTimerComplete(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // immediate
      });
      logger.info('[Notifications] Timer complete notification sent');
    } catch (err) {
      logger.warn('[Notifications] Failed to send local notification:', err);
    }
  }

  async cancelAllScheduled(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /* ─── Push Token ─── */

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /* ─── Listeners ─── */

  onNotificationReceived(
    handler: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  }

  onNotificationResponse(
    handler: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }
}

export const notificationService = new NotificationService();
