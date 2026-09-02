/**
 * PiP (Picture-in-Picture) Service
 * 
 * Bridges Android's native PiP mode to React Native.
 * When screen sharing is active, the user can minimize the app
 * into a floating window to use other apps while continuing to share.
 */
import { NativeModules, Platform } from 'react-native';

const { PiPModule } = NativeModules;

export class PiPService {
  /**
   * Enter Picture-in-Picture mode (Android only).
   * The app shrinks to a small floating window.
   */
  async enterPiP(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[PiP] PiP is only supported on Android');
      return false;
    }

    if (!PiPModule) {
      console.warn('[PiP] PiPModule native module not found');
      return false;
    }

    try {
      return await PiPModule.enterPiPMode();
    } catch (err) {
      console.warn('[PiP] Failed to enter PiP mode:', err);
      return false;
    }
  }

  /**
   * Check if the device supports PiP mode.
   */
  async isPiPSupported(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!PiPModule) return false;

    try {
      return await PiPModule.isPiPSupported();
    } catch {
      return false;
    }
  }

  /**
   * Check if the app is currently in PiP mode.
   */
  async isInPiPMode(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!PiPModule) return false;

    try {
      return await PiPModule.isInPiPMode();
    } catch {
      return false;
    }
  }

  /**
   * Enable or disable automatic PiP when leaving the app.
   */
  async setAutoPiPEnabled(enabled: boolean): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!PiPModule?.setAutoPiPEnabled) return false;

    try {
      return await PiPModule.setAutoPiPEnabled(enabled);
    } catch {
      return false;
    }
  }
}

export const pipService = new PiPService();
