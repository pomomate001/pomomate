/**
 * Media service — native camera/microphone/screen capture integration.
 * 
 * Wraps platform-specific media APIs and integrates with WebRTC.
 */
import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
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
      // Request permissions on native
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
        try {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
          });
        } catch (e) {
          logger.warn('[Media] Failed to setAudioModeAsync:', e);
        }
      }

      // Constraints for WebRTC
      const constraints = {
        audio: config.audio,
        video: config.video
          ? {
              facingMode: 'user',
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 },
              frameRate: { min: 15, ideal: 30, max: 30 },
            }
          : false,
      };

      let stream: MediaStream | null = null;

      if (Platform.OS === 'web') {
        stream = (await navigator.mediaDevices.getUserMedia(constraints as any)) as unknown as MediaStream;
      } else {
        stream = (await mediaDevices.getUserMedia(constraints)) as unknown as MediaStream;
      }

      this.localStream = stream;
      logger.info('[Media] Media stream acquired successfully');
      return stream;
    } catch (err) {
      logger.warn('[Media] Failed to get media:', err);
      return null;
    }
  }

  stopUserMedia(): void {
    if (!this.localStream) return;
    try {
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }
    } catch (err) {
      logger.warn('[Media] Error stopping tracks:', err);
    }
    this.localStream = null;
    logger.info('[Media] Media stream stopped');
  }

  /* ─── Screen Capture ─── */

  async requestScreenCapture(): Promise<MediaStream | null> {
    try {
      const hasPermission = await ScreenCapture.requestPermissionsAsync();
      if (!hasPermission.granted) {
        logger.warn('[Media] Screen capture permission denied');
        return null;
      }
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
