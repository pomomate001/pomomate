/**
 * Media service — native camera/microphone/screen capture integration.
 * 
 * Wraps platform-specific media APIs and integrates with WebRTC.
 */
import { setAudioModeAsync } from 'expo-audio';
import * as ScreenCapture from 'expo-screen-capture';
import { logger } from '../../../utils/logger';
import { permissionManager } from '../permissions/PermissionManager';

export interface MediaConfig {
  audio: boolean;
  video: boolean;
}

export class MediaService {
  private localStream: MediaStream | null = null;

  /* ─── Audio/Video ─── */

  async getUserMedia(config: MediaConfig): Promise<MediaStream | null> {
    try {
      // Request permissions
      if (config.audio) {
        const mic = await permissionManager.requestMicrophone();
        if (mic.status !== 'granted') {
          logger.warn('[Media] Microphone permission denied');
          return null;
        }
      }

      if (config.video) {
        const cam = await permissionManager.requestCamera();
        if (cam.status !== 'granted') {
          logger.warn('[Media] Camera permission denied');
          return null;
        }
      }

      // Configure audio session for VoIP
      if (config.audio) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config.audio,
        video: config.video ? { facingMode: 'user' } : false,
      });

      this.localStream = stream;
      logger.info('[Media] Media stream acquired');
      return stream;
    } catch (err) {
      logger.warn('[Media] Failed to get media:', err);
      return null;
    }
  }

  stopUserMedia(): void {
    if (!this.localStream) return;
    for (const track of this.localStream.getTracks()) {
      track.stop();
    }
    this.localStream = null;
    logger.info('[Media] Media stream stopped');
  }

  /* ─── Screen Capture ─── */

  async requestScreenCapture(): Promise<MediaStream | null> {
    try {
      // Check if screen capture is available
      const hasPermission = await ScreenCapture.requestPermissionsAsync();
      if (!hasPermission.granted) {
        logger.warn('[Media] Screen capture permission denied');
        return null;
      }

      // Note: getDisplayMedia is web-only; for native, we use platform-specific APIs
      // This is a placeholder — full screen sharing on mobile requires native modules
      logger.warn('[Media] Screen sharing not fully supported on native yet');
      return null;
    } catch (err) {
      logger.warn('[Media] Screen capture failed:', err);
      return null;
    }
  }

  /* ─── Audio Routing ─── */

  async setAudioRoute(route: 'speaker' | 'earpiece'): Promise<void> {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: route === 'earpiece',
        interruptionMode: route === 'speaker' ? 'duckOthers' : 'doNotMix',
      });
      logger.info(`[Media] Audio route set to ${route}`);
    } catch (err) {
      logger.warn('[Media] Failed to set audio route:', err);
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}

export const mediaService = new MediaService();
