import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { FloatingWidget } = NativeModules;

class FloatingWidgetService {
  private listener: any;

  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    if (!FloatingWidget) return false;
    try {
      return await FloatingWidget.checkPermission();
    } catch {
      return false;
    }
  }

  async requestPermission(): Promise<void> {
    if (Platform.OS !== 'android' || !FloatingWidget) return;
    try {
      await FloatingWidget.requestPermission();
    } catch {}
  }

  async showWidget(): Promise<boolean> {
    if (Platform.OS !== 'android' || !FloatingWidget) return false;
    try {
      await FloatingWidget.showWidget();
      return true;
    } catch (e) {
      console.warn("Failed to show floating widget:", e);
      return false;
    }
  }

  async hideWidget(): Promise<void> {
    if (Platform.OS !== 'android' || !FloatingWidget) return;
    try {
      await FloatingWidget.hideWidget();
    } catch {}
  }

  async updateWidgetActions(micOn: boolean, camOn: boolean, screenShareOn: boolean): Promise<void> {
    if (Platform.OS !== 'android' || !FloatingWidget) return;
    try {
      await FloatingWidget.updateWidgetActions(micOn, camOn, screenShareOn);
    } catch {}
  }

  async updateNotificationText(title: string, text: string): Promise<void> {
    if (Platform.OS !== 'android' || !FloatingWidget) return;
    try {
      if (FloatingWidget.updateNotificationText) {
        await FloatingWidget.updateNotificationText(title, text);
      }
    } catch {}
  }

  async setAppLocale(languageCode: string): Promise<void> {
    if (Platform.OS !== 'android' || !FloatingWidget) return;
    try {
      if (FloatingWidget.setAppLocale) {
        await FloatingWidget.setAppLocale(languageCode);
      }
    } catch {}
  }

  addActionListener(callback: (action: string) => void) {
    if (Platform.OS !== 'android') return () => {};
    
    if (this.listener) {
      this.listener.remove();
    }
    
    this.listener = DeviceEventEmitter.addListener('onOverlayAction', callback);
    
    return () => {
      if (this.listener) {
        this.listener.remove();
        this.listener = null;
      }
    };
  }
}

export const floatingWidgetService = new FloatingWidgetService();
