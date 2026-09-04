import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  AdaptiveQualityController,
  type AdaptiveQualityDelegate,
  type ScreenQuality,
} from '../AdaptiveQualityController';
import { useRoomStore } from '../../../state/roomStore';
import { createFileSharingHandler } from '../features/fileSharing';
import * as Network from 'expo-network';

let mockScreenDimensions = { width: 1080, height: 1920 };
let mockPixelRatio = 2;

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((dict: any) => dict.ios ?? dict.default),
    },
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    Dimensions: {
      get: jest.fn(() => mockScreenDimensions),
    },
    PixelRatio: {
      get: jest.fn(() => mockPixelRatio),
    },
  };
});

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
  NetworkStateType: {
    UNKNOWN: 'UNKNOWN',
    NONE: 'NONE',
    CELLULAR: 'CELLULAR',
    WIFI: 'WIFI',
    BLUETOOTH: 'BLUETOOTH',
    ETHERNET: 'ETHERNET',
    VPN: 'VPN',
  },
}));

describe('AdaptiveQualityController', () => {
  let mockDelegate: AdaptiveQualityDelegate;
  let mockTelemetry = { avgRtt: 0.05, packetLossRatio: 0.002 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTelemetry = { avgRtt: 0.05, packetLossRatio: 0.002 };
    mockScreenDimensions = { width: 1080, height: 1920 };
    mockPixelRatio = 2;

    mockDelegate = {
      setVideoEncodingProfile: jest.fn(async () => {}),
      getPeerTelemetry: jest.fn(async () => mockTelemetry),
    };

    (Network.getNetworkStateAsync as any).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: Network.NetworkStateType.WIFI,
    });
  });

  describe('Initial Quality Evaluation', () => {
    it('evaluates to 1080p on high-resolution display with WiFi network', async () => {
      const controller = new AdaptiveQualityController(mockDelegate);
      const quality = await controller.evaluateInitialQuality();
      expect(quality).toBe('1080p');
    });

    it('evaluates to 720p on Cellular network to conserve mobile data', async () => {
      (Network.getNetworkStateAsync as any).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.CELLULAR,
      });

      const controller = new AdaptiveQualityController(mockDelegate);
      const quality = await controller.evaluateInitialQuality();
      expect(quality).toBe('720p');
    });

    it('evaluates to 720p on low-resolution physical screen', async () => {
      mockScreenDimensions = { width: 360, height: 640 };
      mockPixelRatio = 1; // 640px max physical < 1280

      const controller = new AdaptiveQualityController(mockDelegate);
      const quality = await controller.evaluateInitialQuality();
      expect(quality).toBe('720p');
    });
  });

  describe('Dynamic Quality Adaptation', () => {
    it('downgrades from 1080p to 720p when round-trip latency is high (RTT > 220ms)', async () => {
      const controller = new AdaptiveQualityController(mockDelegate);
      await controller.evaluateInitialQuality();
      expect(controller.getCurrentQuality()).toBe('1080p');

      // Emulate latency spike: RTT = 350ms
      mockTelemetry = { avgRtt: 0.35, packetLossRatio: 0.005 };

      controller.startMonitoring();
      // Allow async check to process
      await new Promise((r) => setTimeout(r, 50));
      controller.stopMonitoring();

      expect(controller.getCurrentQuality()).toBe('720p');
      expect(mockDelegate.setVideoEncodingProfile).toHaveBeenCalledWith('720p');
    });

    it('downgrades from 1080p to 720p when packet loss exceeds threshold (> 3%)', async () => {
      const controller = new AdaptiveQualityController(mockDelegate);
      await controller.evaluateInitialQuality();

      mockTelemetry = { avgRtt: 0.06, packetLossRatio: 0.05 }; // 5% packet loss

      controller.startMonitoring();
      await new Promise((r) => setTimeout(r, 50));
      controller.stopMonitoring();

      expect(controller.getCurrentQuality()).toBe('720p');
      expect(mockDelegate.setVideoEncodingProfile).toHaveBeenCalledWith('720p');
    });

    it('upgrades from 720p to 1080p when network stabilizes on WiFi with low RTT and zero loss', async () => {
      (Network.getNetworkStateAsync as any).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.CELLULAR,
      });

      const controller = new AdaptiveQualityController(mockDelegate);
      await controller.evaluateInitialQuality();
      expect(controller.getCurrentQuality()).toBe('720p');

      // Now user connects to WiFi with low latency
      (Network.getNetworkStateAsync as any).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: Network.NetworkStateType.WIFI,
      });
      mockTelemetry = { avgRtt: 0.04, packetLossRatio: 0.001 };

      controller.startMonitoring();
      await new Promise((r) => setTimeout(r, 50));
      controller.stopMonitoring();

      expect(controller.getCurrentQuality()).toBe('1080p');
      expect(mockDelegate.setVideoEncodingProfile).toHaveBeenCalledWith('1080p');
    });
  });

  describe('Room Members Profile Hydration in Store', () => {
    it('merges displayName and avatarUrl when a member is added or updated', () => {
      useRoomStore.getState().setMembers([]);

      // Initial member joined with basic ID
      useRoomStore.getState().addMember({
        id: 'user-123',
        roomId: 'room-abc',
        userId: 'user-123',
        role: 'member',
        joinedAt: new Date().toISOString(),
      });

      expect(useRoomStore.getState().members[0].displayName).toBeUndefined();

      // Profile information arrives
      useRoomStore.getState().addMember({
        id: 'user-123',
        roomId: 'room-abc',
        userId: 'user-123',
        displayName: 'Ayşe Yılmaz',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'member',
        joinedAt: new Date().toISOString(),
      });

      const member = useRoomStore.getState().members[0];
      expect(member.displayName).toBe('Ayşe Yılmaz');
      expect(member.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('File Sharing Feature Synchronization', () => {
    it('handles incoming add, setActive, and remove events', () => {
      useRoomStore.getState().setSharedFiles([]);
      useRoomStore.getState().setActiveSharedFileId(null);

      const handler = createFileSharingHandler();

      // 1. Add file
      handler.onMessage({
        type: 'file-shared',
        senderId: 'remote-user',
        timestamp: Date.now(),
        payload: {
          action: 'add',
          file: {
            id: 'file-99',
            uri: 'data:image/jpeg;base64,mockdata',
            fileName: 'study_notes.pdf',
            fileType: 'image',
            sharedBy: 'remote-user',
          },
          fileId: 'file-99',
        },
      });

      expect(useRoomStore.getState().sharedFiles).toHaveLength(1);
      expect(useRoomStore.getState().sharedFiles[0].fileName).toBe('study_notes.pdf');
      expect(useRoomStore.getState().activeSharedFileId).toBe('file-99');

      // 2. Set active
      handler.onMessage({
        type: 'file-shared',
        senderId: 'remote-user',
        timestamp: Date.now(),
        payload: {
          action: 'setActive',
          fileId: null,
        },
      });
      expect(useRoomStore.getState().activeSharedFileId).toBeNull();

      // 3. Remove file
      handler.onMessage({
        type: 'file-shared',
        senderId: 'remote-user',
        timestamp: Date.now(),
        payload: {
          action: 'remove',
          fileId: 'file-99',
        },
      });
      expect(useRoomStore.getState().sharedFiles).toHaveLength(0);
    });
  });
});
