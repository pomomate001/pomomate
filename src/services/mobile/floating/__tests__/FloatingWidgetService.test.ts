import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const mockFloatingWidget = {
  checkPermission: jest.fn<() => Promise<boolean>>(),
  requestPermission: jest.fn<() => Promise<boolean>>(),
  showWidget: jest.fn<() => Promise<boolean>>(),
  hideWidget: jest.fn<() => Promise<boolean>>(),
  updateWidgetActions: jest.fn<(mic: boolean, cam: boolean, screen: boolean) => Promise<boolean>>(),
};

// Set up native module before importing the service
(NativeModules as any).FloatingWidget = mockFloatingWidget;

// Import service under test
import { floatingWidgetService } from '../FloatingWidgetService';

describe('FloatingWidgetService (Mini Mod)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'android';
  });

  describe('checkPermission', () => {
    it('returns true on non-Android platforms', async () => {
      (Platform as any).OS = 'ios';
      const result = await floatingWidgetService.checkPermission();
      expect(result).toBe(true);
      expect(mockFloatingWidget.checkPermission).not.toHaveBeenCalled();
    });

    it('returns true when Android overlay permission is granted', async () => {
      mockFloatingWidget.checkPermission.mockResolvedValueOnce(true);
      const result = await floatingWidgetService.checkPermission();
      expect(result).toBe(true);
      expect(mockFloatingWidget.checkPermission).toHaveBeenCalledTimes(1);
    });

    it('returns false when Android overlay permission is denied', async () => {
      mockFloatingWidget.checkPermission.mockResolvedValueOnce(false);
      const result = await floatingWidgetService.checkPermission();
      expect(result).toBe(false);
      expect(mockFloatingWidget.checkPermission).toHaveBeenCalledTimes(1);
    });

    it('handles native checkPermission rejection safely by returning false', async () => {
      mockFloatingWidget.checkPermission.mockRejectedValueOnce(new Error('Permission check failure'));
      const result = await floatingWidgetService.checkPermission();
      expect(result).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('calls native requestPermission on Android', async () => {
      mockFloatingWidget.requestPermission.mockResolvedValueOnce(true);
      await floatingWidgetService.requestPermission();
      expect(mockFloatingWidget.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('does nothing on non-Android platforms', async () => {
      (Platform as any).OS = 'ios';
      await floatingWidgetService.requestPermission();
      expect(mockFloatingWidget.requestPermission).not.toHaveBeenCalled();
    });
  });

  describe('showWidget (Mini Mode Entry)', () => {
    it('invokes native showWidget and returns true on success', async () => {
      mockFloatingWidget.showWidget.mockResolvedValueOnce(true);
      const success = await floatingWidgetService.showWidget();
      expect(success).toBe(true);
      expect(mockFloatingWidget.showWidget).toHaveBeenCalledTimes(1);
    });

    it('returns false gracefully if native showWidget throws an error', async () => {
      mockFloatingWidget.showWidget.mockRejectedValueOnce(new Error('Foreground service start rejected'));
      const success = await floatingWidgetService.showWidget();
      expect(success).toBe(false);
    });

    it('returns false on non-Android platforms without calling native module', async () => {
      (Platform as any).OS = 'ios';
      const success = await floatingWidgetService.showWidget();
      expect(success).toBe(false);
      expect(mockFloatingWidget.showWidget).not.toHaveBeenCalled();
    });
  });

  describe('hideWidget (Mini Mode Exit)', () => {
    it('calls native hideWidget to stop service and remove floating bubble', async () => {
      mockFloatingWidget.hideWidget.mockResolvedValueOnce(true);
      await floatingWidgetService.hideWidget();
      expect(mockFloatingWidget.hideWidget).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateWidgetActions', () => {
    it('updates mic, camera, and screen share state in native widget', async () => {
      mockFloatingWidget.updateWidgetActions.mockResolvedValueOnce(true);
      await floatingWidgetService.updateWidgetActions(true, false, true);
      expect(mockFloatingWidget.updateWidgetActions).toHaveBeenCalledWith(true, false, true);
    });

    it('handles native update failure gracefully without unhandled rejection', async () => {
      mockFloatingWidget.updateWidgetActions.mockRejectedValueOnce(new Error('Widget not active'));
      await expect(floatingWidgetService.updateWidgetActions(false, false, false)).resolves.toBeUndefined();
    });
  });

  describe('addActionListener (Overlay Event Routing)', () => {
    it('subscribes to onOverlayAction and dispatches toggleMic event', () => {
      const mockCallback = jest.fn();
      const unsubscribe = floatingWidgetService.addActionListener(mockCallback);

      DeviceEventEmitter.emit('onOverlayAction', 'toggleMic');
      expect(mockCallback).toHaveBeenCalledWith('toggleMic');

      unsubscribe();
      DeviceEventEmitter.emit('onOverlayAction', 'toggleMic');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('routes toggleCam and toggleScreen events correctly', () => {
      const mockCallback = jest.fn();
      const unsubscribe = floatingWidgetService.addActionListener(mockCallback);

      DeviceEventEmitter.emit('onOverlayAction', 'toggleCam');
      DeviceEventEmitter.emit('onOverlayAction', 'toggleScreen');

      expect(mockCallback).toHaveBeenCalledWith('toggleCam');
      expect(mockCallback).toHaveBeenCalledWith('toggleScreen');
      expect(mockCallback).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it('cleans up previous listener when adding a new listener', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      floatingWidgetService.addActionListener(firstCallback);
      const unsubscribeSecond = floatingWidgetService.addActionListener(secondCallback);

      DeviceEventEmitter.emit('onOverlayAction', 'toggleMic');

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith('toggleMic');

      unsubscribeSecond();
    });
  });
});
