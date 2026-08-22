/**
 * Network monitor — tracks connectivity changes.
 * 
 * Notifies app when network becomes available/unavailable for reconnection logic.
 */
import * as Network from 'expo-network';
import { logger } from '../../../utils/logger';

type NetworkChangeHandler = (isConnected: boolean) => void;

export class NetworkMonitor {
  private handlers = new Set<NetworkChangeHandler>();
  private isConnected = true;
  private interval: ReturnType<typeof setInterval> | null = null;

  start(): void {
    this.checkConnectivity();
    // Poll network state every 5s
    this.interval = setInterval(() => this.checkConnectivity(), 5000);
    logger.info('[Network] Monitoring started');
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    logger.info('[Network] Monitoring stopped');
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected === true && state.isInternetReachable === true;

      if (connected !== this.isConnected) {
        this.isConnected = connected;
        logger.info(`[Network] State changed: ${connected ? 'online' : 'offline'}`);
        this.handlers.forEach((h) => h(connected));
      }
    } catch {
      // Ignore errors
    }
  }

  onChange(handler: NetworkChangeHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const networkMonitor = new NetworkMonitor();
