/**
 * Room feature registry — extensible plugin system.
 *
 * Each room feature (timer, tasks, chat, media, files, future features)
 * registers a handler. The registry routes incoming data channel messages
 * to the appropriate handler based on message type.
 *
 * To add a new room feature:
 *   1. Create a RoomFeatureHandler implementation
 *   2. Call registry.register(handler)
 *   3. The feature's UI component is added in M02 via the "+" menu
 */
import type { DataChannelMessage, RoomFeatureHandler } from './types';

export class RoomFeatureRegistry {
  private features = new Map<string, RoomFeatureHandler>();
  private messageTypeToFeature = new Map<string, string>();

  /** Register a feature handler. */
  register(handler: RoomFeatureHandler, messageTypes: string[]): void {
    this.features.set(handler.id, handler);
    for (const mt of messageTypes) {
      this.messageTypeToFeature.set(mt, handler.id);
    }
  }

  /** Unregister a feature. */
  unregister(featureId: string): void {
    const handler = this.features.get(featureId);
    handler?.onDeactivate?.();
    this.features.delete(featureId);

    // Clean up message type mappings
    for (const [mt, fId] of this.messageTypeToFeature) {
      if (fId === featureId) this.messageTypeToFeature.delete(mt);
    }
  }

  /** Route an incoming data channel message to the right handler. */
  dispatch(msg: DataChannelMessage): void {
    const featureId = this.messageTypeToFeature.get(msg.type);
    if (!featureId) return;
    const handler = this.features.get(featureId);
    handler?.onMessage(msg);
  }

  /** Activate a feature. */
  activate(featureId: string): void {
    this.features.get(featureId)?.onActivate?.();
  }

  /** Deactivate a feature. */
  deactivate(featureId: string): void {
    this.features.get(featureId)?.onDeactivate?.();
  }

  /** List all registered feature ids. */
  getRegisteredFeatures(): string[] {
    return Array.from(this.features.keys());
  }
}
