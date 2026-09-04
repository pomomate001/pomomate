/**
 * PiP (Picture-in-Picture) Service
 * 
 * Bridges Android's native PiP mode to React Native.
 * When screen sharing is active, the user can minimize the app
 * into a floating window to use other apps while continuing to share.
 */
import { NativeModules, Platform, DeviceEventEmitter, NativeEventEmitter } from 'react-native';

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

    if (!PiPModule?.enterPiPMode) {
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
    if (!PiPModule?.isPiPSupported) {
      return (Platform.Version as number) >= 26;
    }

    try {
      return await PiPModule.isPiPSupported();
    } catch {
      return (Platform.Version as number) >= 26;
    }
  }

  /**
   * Check if the app is currently in PiP mode.
   */
  async isInPiPMode(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!PiPModule?.isInPiPMode) return false;

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

  /**
   * Listen to native PiP state changes.
   */
  addPiPListener(callback: (isInPiP: boolean) => void): () => void {
    if (Platform.OS !== 'android') return () => {};

    if (PiPModule) {
      try {
        const emitter = new NativeEventEmitter(PiPModule);
        const sub = emitter.addListener('onPiPModeChanged', callback);
        return () => sub.remove();
      } catch {
        const sub = DeviceEventEmitter.addListener('onPiPModeChanged', callback);
        return () => sub.remove();
      }
    }

    const sub = DeviceEventEmitter.addListener('onPiPModeChanged', callback);
    return () => sub.remove();
  }

  /**
   * Update native PiP overlay action buttons (Mic, Camera)
   */
  async updatePiPActions(micOn: boolean, camOn: boolean): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!PiPModule?.updatePiPActions) return false;

    try {
      return await PiPModule.updatePiPActions(micOn, camOn);
    } catch {
      return false;
    }
  }

  /**
   * Listen for native PiP action clicks (e.g. mic or cam toggle from system overlay)
   */
  addPiPActionListener(callback: (action: string) => void): () => void {
    if (Platform.OS !== 'android') return () => {};

    if (PiPModule) {
      try {
        const emitter = new NativeEventEmitter(PiPModule);
        const sub = emitter.addListener('onPiPAction', callback);
        return () => sub.remove();
      } catch {
        const sub = DeviceEventEmitter.addListener('onPiPAction', callback);
        return () => sub.remove();
      }
    }

    const sub = DeviceEventEmitter.addListener('onPiPAction', callback);
    return () => sub.remove();
  }
}

export const pipService = new PiPService();

