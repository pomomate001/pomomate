import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Mini Mode Android Native Architecture & Contract Validation', () => {
  const rootDir = path.resolve(__dirname, '../../../../..');
  const androidDir = path.join(rootDir, 'android/app/src/main');

  describe('AndroidManifest.xml Integrity', () => {
    const manifestPath = path.join(androidDir, 'AndroidManifest.xml');
    let manifestContent: string;

    it('manifest file exists and is readable', () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
      manifestContent = fs.readFileSync(manifestPath, 'utf8');
    });

    it('declares SYSTEM_ALERT_WINDOW overlay permission', () => {
      expect(manifestContent).toContain('android.permission.SYSTEM_ALERT_WINDOW');
    });

    it('declares FOREGROUND_SERVICE permission', () => {
      expect(manifestContent).toContain('android.permission.FOREGROUND_SERVICE');
    });

    it('declares FOREGROUND_SERVICE_SPECIAL_USE permission for Android 14+', () => {
      expect(manifestContent).toContain('android.permission.FOREGROUND_SERVICE_SPECIAL_USE');
    });

    it('registers FloatingWidgetService with foregroundServiceType specialUse', () => {
      expect(manifestContent).toMatch(/<service[^>]*android:name="\.FloatingWidgetService"[^>]*android:foregroundServiceType="specialUse"/s);
    });

    it('declares PROPERTY_SPECIAL_USE_FGS_SUBTYPE property in FloatingWidgetService', () => {
      expect(manifestContent).toContain('android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE');
    });
  });

  describe('FloatingWidgetService.kt Native Implementation', () => {
    const servicePath = path.join(androidDir, 'java/com/pomomate/app/FloatingWidgetService.kt');
    let serviceContent: string;

    it('FloatingWidgetService.kt file exists', () => {
      expect(fs.existsSync(servicePath)).toBe(true);
      serviceContent = fs.readFileSync(servicePath, 'utf8');
    });

    it('extends ExpandableBubbleService', () => {
      expect(serviceContent).toContain('class FloatingWidgetService : ExpandableBubbleService()');
    });

    it('overrides startNotificationForeground() to intercept library foreground lifecycle cleanly', () => {
      expect(serviceContent).toContain('override fun startNotificationForeground()');
    });

    it('does NOT declare unsupported initialNotification or setupNotificationBuilder overrides', () => {
      expect(serviceContent).not.toContain('override fun initialNotification()');
      expect(serviceContent).not.toContain('override fun setupNotificationBuilder(');
    });

    it('configures both compact bubble and expanded menu layout builders', () => {
      expect(serviceContent).toContain('override fun configBubble(): BubbleBuilder?');
      expect(serviceContent).toContain('override fun configExpandedBubble(): ExpandedBubbleBuilder?');
    });

    it('implements state synchronization methods for mic, cam, and screen share', () => {
      expect(serviceContent).toContain('fun updateButtonStates()');
      expect(serviceContent).toContain('currentMicOn');
      expect(serviceContent).toContain('currentCamOn');
      expect(serviceContent).toContain('currentScreenShareOn');
    });
  });

  describe('FloatingWidgetModule.kt Native Bridge', () => {
    const modulePath = path.join(androidDir, 'java/com/pomomate/app/FloatingWidgetModule.kt');
    let moduleContent: string;

    it('FloatingWidgetModule.kt file exists', () => {
      expect(fs.existsSync(modulePath)).toBe(true);
      moduleContent = fs.readFileSync(modulePath, 'utf8');
    });

    it('uses moveTaskToBack(true) to avoid Android 12 background launch race conditions', () => {
      expect(moduleContent).toContain('currentActivity?.moveTaskToBack(true)');
    });

    it('provides graceful fallback when starting service under strict background limits', () => {
      expect(moduleContent).toContain('fallbackIntent');
      expect(moduleContent).toContain('reactContext.startService(fallbackIntent)');
    });

    it('exports showWidget, hideWidget, checkPermission, requestPermission, updateWidgetActions', () => {
      expect(moduleContent).toContain('fun showWidget(');
      expect(moduleContent).toContain('fun hideWidget(');
      expect(moduleContent).toContain('fun checkPermission(');
      expect(moduleContent).toContain('fun requestPermission(');
      expect(moduleContent).toContain('fun updateWidgetActions(');
    });
  });

  describe('UI Layouts & Drawables', () => {
    const resDir = path.join(androidDir, 'res');

    it('floating_bubble layout exists and has bubble background and logo', () => {
      const bubblePath = path.join(resDir, 'layout/floating_bubble.xml');
      expect(fs.existsSync(bubblePath)).toBe(true);
      const content = fs.readFileSync(bubblePath, 'utf8');
      expect(content).toContain('@drawable/bg_bubble');
      expect(content).toContain('@drawable/ic_logo');
    });

    it('floating_menu layout exists and contains action buttons', () => {
      const menuPath = path.join(resDir, 'layout/floating_menu.xml');
      expect(fs.existsSync(menuPath)).toBe(true);
      const content = fs.readFileSync(menuPath, 'utf8');
      expect(content).toContain('@+id/btn_mic');
      expect(content).toContain('@+id/btn_cam');
      expect(content).toContain('@+id/btn_screen');
      expect(content).toContain('@+id/btn_open_app');
      expect(content).toContain('@+id/btn_close_menu');
    });

    it('all toggle icon drawables exist', () => {
      const drawables = [
        'ic_pip_mic_on.xml',
        'ic_pip_mic_off.xml',
        'ic_pip_cam_on.xml',
        'ic_pip_cam_off.xml',
        'ic_pip_screen_on.xml',
        'ic_pip_screen_off.xml',
        'bg_bubble.xml',
        'bg_menu.xml',
        'ic_logo.xml',
        'ic_pip_close.xml',
        'ic_pip_expand.xml',
      ];

      for (const drawable of drawables) {
        const filePath = path.join(resDir, 'drawable', drawable);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });
  });
});
