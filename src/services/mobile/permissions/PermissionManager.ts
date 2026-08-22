/**
 * Permission manager — handles runtime permissions for camera, microphone, notifications.
 * 
 * Uses Expo modules for cross-platform permission requests.
 */
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { logger } from '../../../utils/logger';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export class PermissionManager {
  /* ─── Camera ─── */
  
  async requestCamera(): Promise<PermissionResult> {
    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      logger.info(`[Permissions] Camera: ${status}`);
      return { status: this.mapStatus(status), canAskAgain };
    } catch (err) {
      logger.warn('[Permissions] Camera request failed:', err);
      return { status: 'denied', canAskAgain: false };
    }
  }

  async checkCamera(): Promise<PermissionStatus> {
    const { status } = await Camera.getCameraPermissionsAsync();
    return this.mapStatus(status);
  }

  /* ─── Microphone ─── */
  
  async requestMicrophone(): Promise<PermissionResult> {
    try {
      const { status, canAskAgain } = await Camera.requestMicrophonePermissionsAsync();
      logger.info(`[Permissions] Microphone: ${status}`);
      return { status: this.mapStatus(status), canAskAgain };
    } catch (err) {
      logger.warn('[Permissions] Microphone request failed:', err);
      return { status: 'denied', canAskAgain: false };
    }
  }

  async checkMicrophone(): Promise<PermissionStatus> {
    const { status } = await Camera.getMicrophonePermissionsAsync();
    return this.mapStatus(status);
  }

  /* ─── Notifications ─── */
  
  async requestNotifications(): Promise<PermissionResult> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      logger.info(`[Permissions] Notifications: ${status}`);
      return { status: this.mapStatus(status), canAskAgain };
    } catch (err) {
      logger.warn('[Permissions] Notification request failed:', err);
      return { status: 'denied', canAskAgain: false };
    }
  }

  async checkNotifications(): Promise<PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return this.mapStatus(status);
  }

  /* ─── Helper ─── */
  
  private mapStatus(status: string): PermissionStatus {
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  }
}

export const permissionManager = new PermissionManager();
