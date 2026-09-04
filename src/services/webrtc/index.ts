export { SignalingClient } from './SignalingClient';
export { PeerManager } from './PeerManager';
export { RoomFeatureRegistry } from './RoomFeatureRegistry';
export { RoomClient, type RoomClientOptions } from './RoomClient';
export { AdaptiveQualityController, type ScreenQuality, type QualityMetrics } from './AdaptiveQualityController';
export * from './features';
export type {
  SignalingMessage,
  SignalingMessageType,
  PeerInfo,
  ConnectionState,
  DataChannelMessage,
  DataChannelMessageType,
  RoomFeatureHandler,
  RoomUserProfile,
} from './types';
