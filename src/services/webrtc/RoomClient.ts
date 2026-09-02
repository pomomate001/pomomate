/**
 * RoomClient — high-level orchestrator for a P2P room session.
 *
 * Wires together signaling, peer management, feature registry,
 * and media streams. This is the single entry point the UI uses
 * to interact with a live room.
 */
import { SignalingClient } from './SignalingClient';
import { PeerManager } from './PeerManager';
import { RoomFeatureRegistry } from './RoomFeatureRegistry';
import {
  createTimerSyncHandler,
  createTaskSyncHandler,
  createChatTransportHandler,
  createFileSharingHandler,
  getTimerSyncPayload,
  getTaskSyncPayload,
} from './features';
import { useRoomStore, useChatStore } from '../../state';
import { logger } from '../../utils/logger';
import type { ConnectionState } from './types';
import type { Message } from '../../types';
import { mediaService } from '../mobile/media/MediaService';
import type { MediaStream } from 'react-native-webrtc';

interface RoomClientOptions {
  signalingUrl: string;
  token: string;
  roomId: string;
  userId: string;
  isHost: boolean;
}

export class RoomClient {
  private signaling: SignalingClient;
  private peerManager: PeerManager;
  private featureRegistry: RoomFeatureRegistry;
  private roomId: string;
  private userId: string;
  private isHost: boolean;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: RoomClientOptions) {
    this.roomId = options.roomId;
    this.userId = options.userId;
    this.isHost = options.isHost;

    // Signaling
    this.signaling = new SignalingClient(options.roomId);

    // Peer management
    this.peerManager = new PeerManager(
      this.signaling,
      this.userId,
      this.roomId,
      this.isHost,
    );

    // Feature registry
    this.featureRegistry = new RoomFeatureRegistry();
    this.registerDefaultFeatures();

    // Route data channel messages through feature registry
    this.peerManager.onDataMessage((msg) => {
      this.featureRegistry.dispatch(msg);
    });

    // Track connection state changes
    this.peerManager.onStateChange(this.handlePeerStateChange.bind(this));
  }

  /* ─── Lifecycle ─── */

  connect(): void {
    this.signaling.connect();
    this.peerManager.joinRoom();

    // Host periodically broadcasts state
    if (this.isHost) {
      this.syncInterval = setInterval(() => this.broadcastHostState(), 1000);
    }

    logger.info(`[RoomClient] Connected to room ${this.roomId} as ${this.isHost ? 'host' : 'member'}`);
  }

  disconnect(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.peerManager.leaveRoom();
    this.signaling.disconnect();
    logger.info(`[RoomClient] Disconnected from room ${this.roomId}`);
  }

  /* ─── Chat ─── */

  sendChatMessage(content: string): void {
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roomId: this.roomId,
      userId: this.userId,
      content,
      timestamp: new Date().toISOString(),
    };

    // Add to local store
    useChatStore.getState().addMessage(msg);

    // Broadcast via data channel
    this.peerManager.broadcast({
      type: 'chat',
      payload: msg,
    });
  }

  /* ─── Media ─── */

  async enableAudioVideo(audio: boolean, video: boolean): Promise<MediaStream | null> {
    try {
      const stream = await mediaService.getUserMedia({ audio, video });
      if (stream) {
        this.peerManager.setLocalStream(stream);
      }
      return stream;
    } catch (err) {
      logger.warn('[RoomClient] Failed to get media:', err);
      return null;
    }
  }

  async enableScreenShare(): Promise<MediaStream | null> {
    try {
      const stream = await mediaService.getDisplayMedia();
      if (stream) {
        this.peerManager.setLocalStream(stream);
      }
      return stream;
    } catch (err) {
      logger.warn('[RoomClient] Failed to get screen share:', err);
      return null;
    }
  }

  stopMedia(): void {
    mediaService.stopUserMedia();
    this.peerManager.setLocalStream(null);
  }

  onRemoteStream(handler: (userId: string, stream: MediaStream) => void): () => void {
    return this.peerManager.onMediaStream(handler);
  }

  onPeerStateChange(handler: (userId: string, state: ConnectionState) => void): () => void {
    return this.peerManager.onStateChange(handler);
  }

  /* ─── Feature management ─── */

  getFeatureRegistry(): RoomFeatureRegistry {
    return this.featureRegistry;
  }

  /* ─── Private ─── */

  private registerDefaultFeatures(): void {
    this.featureRegistry.register(
      createTimerSyncHandler(this.isHost),
      ['timer-sync'],
    );
    this.featureRegistry.register(
      createTaskSyncHandler(this.isHost),
      ['task-sync'],
    );
    this.featureRegistry.register(
      createChatTransportHandler(),
      ['chat'],
    );
    this.featureRegistry.register(
      createFileSharingHandler((payload) => {
        logger.info(`[RoomClient] File shared: ${payload.fileName}`);
      }),
      ['file-shared'],
    );
  }

  private lastTimerStateStr: string = '';
  private lastTaskStateStr: string = '';
  private ticks: number = 0;

  /** Host broadcasts timer + task state to all peers. */
  private broadcastHostState(): void {
    if (!this.isHost) return;
    this.ticks++;

    const timerPayload = getTimerSyncPayload();
    const taskPayload = getTaskSyncPayload();

    const timerStr = JSON.stringify(timerPayload);
    const taskStr = JSON.stringify(taskPayload);

    const isHeartbeat = this.ticks % 5 === 0; // Every 5 seconds

    if (timerStr !== this.lastTimerStateStr || isHeartbeat) {
      this.lastTimerStateStr = timerStr;
      this.peerManager.broadcast({
        type: 'timer-sync',
        payload: timerPayload,
      });
    }

    if (taskStr !== this.lastTaskStateStr || isHeartbeat) {
      this.lastTaskStateStr = taskStr;
      this.peerManager.broadcast({
        type: 'task-sync',
        payload: taskPayload,
      });
    }
  }

  private handlePeerStateChange(userId: string, state: ConnectionState): void {
    logger.info(`[RoomClient] Peer ${userId} state: ${state}`);

    if (state === 'connected') {
      useRoomStore.getState().addMember({
        id: userId,
        roomId: this.roomId,
        userId,
        role: 'member',
        joinedAt: new Date().toISOString(),
      });
    } else if (state === 'disconnected' || state === 'failed') {
      useRoomStore.getState().removeMember(userId);
    }
  }
}
