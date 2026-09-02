/**
 * WebRTC + signaling type definitions.
 */
import type { RTCPeerConnection, MediaStream } from 'react-native-webrtc';

/* ─── Signaling ─── */

export type SignalingMessageType =
  | 'join'
  | 'leave'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'presence'
  | 'error';

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId?: string;
  userId?: string;
  targetUserId?: string;
  payload?: unknown;
}

/* ─── WebRTC ─── */
type RTCDataChannel = any;

export interface PeerInfo {
  userId: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  mediaStream: MediaStream | null;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

/* ─── Data Channel Messages ─── */

export type DataChannelMessageType =
  | 'timer-sync'
  | 'task-sync'
  | 'chat'
  | 'presence-update'
  | 'room-state'
  | 'file-shared';

export interface DataChannelMessage {
  type: DataChannelMessageType;
  senderId: string;
  payload: unknown;
  timestamp: number;
}

/* ─── Room Feature Registry ─── */

export interface RoomFeatureHandler {
  /** Unique feature id (matches UI feature ids). */
  id: string;
  /** Called when a data channel message for this feature arrives. */
  onMessage: (msg: DataChannelMessage) => void;
  /** Called when feature is activated in the room. */
  onActivate?: () => void;
  /** Called when feature is deactivated. */
  onDeactivate?: () => void;
}
