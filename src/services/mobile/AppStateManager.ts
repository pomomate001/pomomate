/**
 * App state manager — handles background/foreground transitions.
 * 
 * Notifies listeners when app goes to background or comes back to foreground.
 * Useful for pausing timers, reconnecting WebRTC, etc.
 */
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../../utils/logger';

type AppStateChangeHandler = (state: 'active' | 'background') => void;

export class AppStateManager {
  private handlers = new Set<AppStateChangeHandler>();
  private currentState: AppStateStatus = AppState.currentState;
  private subscription: ReturnType<typeof AppState.addEventListener> | null = null;

  start(): void {
    this.subscription = AppState.addEventListener('change', this.handleChange.bind(this));
    logger.info('[AppState] Monitoring started');
  }

  stop(): void {
    this.subscription?.remove();
    this.subscription = null;
    logger.info('[AppState] Monitoring stopped');
  }

  private handleChange(nextState: AppStateStatus): void {
    if (this.currentState === nextState) return;

    logger.info(`[AppState] ${this.currentState} → ${nextState}`);

    if (this.currentState.match(/inactive|background/) && nextState === 'active') {
      // App came to foreground
      this.handlers.forEach((h) => h('active'));
    } else if (nextState.match(/inactive|background/)) {
      // App went to background
      this.handlers.forEach((h) => h('background'));
    }

    this.currentState = nextState;
  }

  onChange(handler: AppStateChangeHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const appStateManager = new AppStateManager();
