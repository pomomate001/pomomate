/**
 * Notification service — local and push notifications.
 * 
 * Handles Pomodoro timer completion notifications and future push notifications.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { logger } from '../../../utils/logger';
import { permissionManager } from '../permissions/PermissionManager';
import { tr } from '../../../i18n/translations/tr';
import { en } from '../../../i18n/translations/en';
import { resolveDeviceLanguage } from '../../../i18n/deviceLanguage';
import type { Language } from '../../../i18n/types';

export const TIMER_NOTIFICATION_CHANNEL_ID = 'pomomate_timer_alarms';

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
    // Setup Android Notification Channel with Alarm priority & DND bypass
    await this.setupAndroidChannels();

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

  async setupAndroidChannels(lang?: Language): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      const activeLang = lang || resolveDeviceLanguage();
      const selected = activeLang === 'en' ? en : tr;
      const channelName = selected.timer.timerAlarmsChannelName;
      const channelDesc = selected.timer.timerAlarmsChannelDesc;
      await Notifications.setNotificationChannelAsync(TIMER_NOTIFICATION_CHANNEL_ID, {
        name: channelName,
        description: channelDesc,
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 500, 250, 500],
        enableVibrate: true,
        enableLights: true,
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          flags: {
            enforceAudibility: true,
            requestHardwareAudioVideoSynchronization: false,
          },
        },
      });
      logger.info(`[Notifications] Android Alarm notification channel configured (${lang || 'default'})`);
    } catch (err) {
      logger.warn('[Notifications] Failed to setup Android notification channel:', err);
    }
  }

  async updateChannelsLanguage(lang: Language): Promise<void> {
    await this.setupAndroidChannels(lang);
  }

  /* ─── Local Notifications ─── */

  async scheduleTimerComplete(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          interruptionLevel: 'timeSensitive',
        },
        trigger: Platform.OS === 'android' ? { channelId: TIMER_NOTIFICATION_CHANNEL_ID } : null,
      });
      logger.info('[Notifications] Timer complete alarm notification sent');
    } catch (err) {
      logger.warn('[Notifications] Failed to send local notification:', err);
    }
  }

  async scheduleTimerCompleteIn(seconds: number, title: string, body: string): Promise<string | null> {
    if (seconds <= 0) return null;
    try {
      await this.cancelAllScheduled();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          interruptionLevel: 'timeSensitive',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, Math.round(seconds)),
          channelId: Platform.OS === 'android' ? TIMER_NOTIFICATION_CHANNEL_ID : undefined,
        },
      });
      logger.info(`[Notifications] Timer complete alarm scheduled in ${seconds}s (id: ${id})`);
      return id;
    } catch (err) {
      logger.warn('[Notifications] Failed to schedule future notification:', err);
      return null;
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
