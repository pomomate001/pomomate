/**
 * AdaptiveQualityController — Manages adaptive screen sharing quality (720p ⇄ 1080p).
 * 
 * Automatically selects and transitions video stream bitrate and resolution
 * downscaling based on:
 * 1. Device physical screen resolution & pixel density (screen dimension indicator)
 * 2. Network connection type (WiFi/Ethernet vs Cellular/Mobile Data indicator)
 * 3. Real-time WebRTC telemetry (Round-trip time RTT & packet loss indicator)
 */
import { Dimensions, PixelRatio } from 'react-native';
import * as Network from 'expo-network';
import { logger } from '../../utils/logger';

export type ScreenQuality = '720p' | '1080p';

export interface QualityMetrics {
  quality: ScreenQuality;
  rtt: number;
  packetLoss: number;
  networkType: string;
  isCellular: boolean;
  reason: string;
}

export interface AdaptiveQualityDelegate {
  setVideoEncodingProfile: (quality: ScreenQuality) => Promise<void>;
  getPeerTelemetry: () => Promise<{ avgRtt: number; packetLossRatio: number }>;
}

export class AdaptiveQualityController {
  private delegate: AdaptiveQualityDelegate;
  private currentQuality: ScreenQuality = '1080p';
  private isMonitoring = false;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private onQualityChangeCallbacks = new Set<(metrics: QualityMetrics) => void>();
  private checkIntervalMs = 4000;

  constructor(delegate: AdaptiveQualityDelegate) {
    this.delegate = delegate;
  }

  /**
   * Determine initial quality profile based on device resolution and initial network state.
   */
  async evaluateInitialQuality(): Promise<ScreenQuality> {
    try {
      const { width, height } = Dimensions.get('screen');
      const pixelRatio = PixelRatio.get();
      const maxPhysicalDim = Math.max(width, height) * pixelRatio;

      // Device resolution indicator: Screens with max dimension < 1280 (e.g. low-end phones)
      // will not benefit from 1080p and would waste CPU/GPU.
      if (maxPhysicalDim < 1280) {
        this.currentQuality = '720p';
        logger.info(`[AdaptiveQuality] Screen max dimension is ${maxPhysicalDim}px (< 1280px). Selecting 720p.`);
        return '720p';
      }

      // Network connection indicator:
      const netState = await Network.getNetworkStateAsync();
      const isCellular = netState.type === Network.NetworkStateType.CELLULAR;
      if (isCellular) {
        this.currentQuality = '720p';
        logger.info('[AdaptiveQuality] Initial network is Cellular. Defaulting to 720p to preserve mobile data.');
        return '720p';
      }

      this.currentQuality = '1080p';
      logger.info('[AdaptiveQuality] High-resolution screen on WiFi/Ethernet detected. Defaulting to 1080p HD.');
      return '1080p';
    } catch (err) {
      logger.warn('[AdaptiveQuality] Error during initial evaluation, fallback to 720p:', err);
      this.currentQuality = '720p';
      return '720p';
    }
  }

  /**
   * Start periodic telemetry monitoring during active screen sharing.
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Run first evaluation immediately
    void this.checkAndAdaptQuality();

    this.monitorInterval = setInterval(() => {
      void this.checkAndAdaptQuality();
    }, this.checkIntervalMs);

    logger.info('[AdaptiveQuality] Started adaptive screen quality monitoring');
  }

  /**
   * Stop monitoring when screen share ends.
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    logger.info('[AdaptiveQuality] Stopped adaptive screen quality monitoring');
  }

  /**
   * Periodic evaluation of network conditions and WebRTC telemetry.
   */
  private async checkAndAdaptQuality(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      // 1. Device resolution check
      const { width, height } = Dimensions.get('screen');
      const maxPhysicalDim = Math.max(width, height) * PixelRatio.get();
      if (maxPhysicalDim < 1280) {
        if (this.currentQuality !== '720p') {
          await this.applyQuality('720p', 0, 0, 'none', false, 'Device display physical resolution limit');
        }
        return;
      }

      // 2. Network state check
      const netState = await Network.getNetworkStateAsync();
      const isCellular = netState.type === Network.NetworkStateType.CELLULAR;
      const networkTypeStr = netState.type ?? 'unknown';

      // 3. WebRTC telemetry stats
      const telemetry = await this.delegate.getPeerTelemetry();
      const avgRtt = telemetry.avgRtt; // In seconds (e.g. 0.25 = 250ms)
      const packetLoss = telemetry.packetLossRatio; // 0.0 to 1.0

      // Adaptation rules:
      // A: Downgrade from 1080p to 720p if:
      //    - On cellular network
      //    - RTT > 220ms (0.22s)
      //    - Packet loss ratio > 3% (0.03)
      if (this.currentQuality === '1080p') {
        if (isCellular) {
          await this.applyQuality('720p', avgRtt, packetLoss, networkTypeStr, true, 'Cellular connection active');
        } else if (avgRtt > 0.22) {
          await this.applyQuality('720p', avgRtt, packetLoss, networkTypeStr, false, `High latency detected (RTT: ${Math.round(avgRtt * 1000)}ms)`);
        } else if (packetLoss > 0.03) {
          await this.applyQuality('720p', avgRtt, packetLoss, networkTypeStr, false, `Packet loss detected (${Math.round(packetLoss * 100)}%)`);
        }
      } 
      // B: Upgrade from 720p to 1080p if:
      //    - NOT on cellular (WiFi/Ethernet)
      //    - RTT is low (< 120ms or 0.12s)
      //    - Packet loss is negligible (< 1%)
      else if (this.currentQuality === '720p') {
        if (!isCellular && (avgRtt === 0 || avgRtt < 0.12) && packetLoss < 0.01) {
          await this.applyQuality('1080p', avgRtt, packetLoss, networkTypeStr, false, 'Network conditions stable and fast');
        }
      }
    } catch (err) {
      logger.warn('[AdaptiveQuality] Error during telemetry check:', err);
    }
  }

  /**
   * Apply quality change and notify listeners.
   */
  private async applyQuality(
    targetQuality: ScreenQuality,
    rtt: number,
    packetLoss: number,
    networkType: string,
    isCellular: boolean,
    reason: string,
  ): Promise<void> {
    const previousQuality = this.currentQuality;
    this.currentQuality = targetQuality;

    try {
      await this.delegate.setVideoEncodingProfile(targetQuality);
      logger.info(`[AdaptiveQuality] Switched quality from ${previousQuality} to ${targetQuality}. Reason: ${reason}`);

      const metrics: QualityMetrics = {
        quality: targetQuality,
        rtt,
        packetLoss,
        networkType,
        isCellular,
        reason,
      };

      this.onQualityChangeCallbacks.forEach((cb) => cb(metrics));
    } catch (err) {
      logger.warn(`[AdaptiveQuality] Failed to apply encoding profile ${targetQuality}:`, err);
    }
  }

  /**
   * Force manual override of quality (if user taps or overrides).
   */
  async setManualQuality(quality: ScreenQuality): Promise<void> {
    await this.applyQuality(quality, 0, 0, 'manual', false, 'Manual override');
  }

  getCurrentQuality(): ScreenQuality {
    return this.currentQuality;
  }

  onQualityChange(callback: (metrics: QualityMetrics) => void): () => void {
    this.onQualityChangeCallbacks.add(callback);
    return () => this.onQualityChangeCallbacks.delete(callback);
  }
}
