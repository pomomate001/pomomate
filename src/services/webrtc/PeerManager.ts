/**
 * Peer connection manager — manages WebRTC connections to room peers.
 *
 * Host-authoritative model:
 *  - Host creates connections to all members.
 *  - Members create connections to host.
 *  - Data channels carry timer/task/chat sync messages.
 *  - Media streams carry audio/video.
 */
import { logger } from '../../utils/logger';
import { SignalingClient } from './SignalingClient';
import type { PeerInfo, DataChannelMessage, ConnectionState, SignalingMessage } from './types';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN servers can be added here for NAT traversal
];

type DataMessageHandler = (msg: DataChannelMessage) => void;
type MediaStreamHandler = (userId: string, stream: MediaStream) => void;
type StateChangeHandler = (userId: string, state: ConnectionState) => void;

export class PeerManager {
  private peers = new Map<string, PeerInfo>();
  private signaling: SignalingClient;
  private localUserId: string;
  private roomId: string;
  private isHost: boolean;
  private localStream: MediaStream | null = null;

  private dataHandlers = new Set<DataMessageHandler>();
  private mediaHandlers = new Set<MediaStreamHandler>();
  private stateHandlers = new Set<StateChangeHandler>();

  constructor(
    signaling: SignalingClient,
    localUserId: string,
    roomId: string,
    isHost: boolean,
  ) {
    this.signaling = signaling;
    this.localUserId = localUserId;
    this.roomId = roomId;
    this.isHost = isHost;

    this.signaling.onMessage(this.handleSignalingMessage.bind(this));
  }

  /* ─── Public API ─── */

  /** Join the signaling room and start peer connections. */
  joinRoom(): void {
    this.signaling.send({
      type: 'join',
      roomId: this.roomId,
      userId: this.localUserId,
    });
  }

  /** Leave room and close all connections. */
  leaveRoom(): void {
    this.signaling.send({
      type: 'leave',
      roomId: this.roomId,
      userId: this.localUserId,
    });
    this.closeAll();
  }

  /** Send a data message to all connected peers. */
  broadcast(msg: Omit<DataChannelMessage, 'senderId' | 'timestamp'>): void {
    const full: DataChannelMessage = {
      ...msg,
      senderId: this.localUserId,
      timestamp: Date.now(),
    };
    const data = JSON.stringify(full);

    for (const peer of this.peers.values()) {
      if (peer.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(data);
      }
    }
  }

  /** Send a data message to a specific peer. */
  sendTo(userId: string, msg: Omit<DataChannelMessage, 'senderId' | 'timestamp'>): void {
    const peer = this.peers.get(userId);
    if (!peer?.dataChannel || peer.dataChannel.readyState !== 'open') return;

    const full: DataChannelMessage = {
      ...msg,
      senderId: this.localUserId,
      timestamp: Date.now(),
    };
    peer.dataChannel.send(JSON.stringify(full));
  }

  /** Set the local media stream (audio/video). */
  setLocalStream(stream: MediaStream | null): void {
    this.localStream = stream;
    // Add tracks to existing connections
    if (stream) {
      for (const peer of this.peers.values()) {
        for (const track of stream.getTracks()) {
          peer.connection.addTrack(track, stream);
        }
      }
    }
  }

  /** Register handlers. */
  onDataMessage(handler: DataMessageHandler): () => void {
    this.dataHandlers.add(handler);
    return () => this.dataHandlers.delete(handler);
  }

  onMediaStream(handler: MediaStreamHandler): () => void {
    this.mediaHandlers.add(handler);
    return () => this.mediaHandlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  getOnlinePeers(): string[] {
    return Array.from(this.peers.keys());
  }

  /* ─── Signaling handlers ─── */

  private async handleSignalingMessage(msg: SignalingMessage): Promise<void> {
    if (msg.roomId !== this.roomId) return;

    switch (msg.type) {
      case 'join':
        if (msg.userId && msg.userId !== this.localUserId) {
          // New peer joined — initiate connection (if host, or for mesh)
          await this.createPeerConnection(msg.userId, true);
        }
        break;

      case 'leave':
        if (msg.userId) this.removePeer(msg.userId);
        break;

      case 'offer':
        if (msg.userId) await this.handleOffer(msg.userId, msg.payload as RTCSessionDescriptionInit);
        break;

      case 'answer':
        if (msg.userId) await this.handleAnswer(msg.userId, msg.payload as RTCSessionDescriptionInit);
        break;

      case 'ice-candidate':
        if (msg.userId) await this.handleIceCandidate(msg.userId, msg.payload as RTCIceCandidateInit);
        break;

      case 'presence':
        // Initial presence — connect to existing peers
        if (Array.isArray(msg.payload)) {
          for (const uid of msg.payload as string[]) {
            if (uid !== this.localUserId && !this.peers.has(uid)) {
              await this.createPeerConnection(uid, true);
            }
          }
        }
        break;
    }
  }

  /* ─── Peer connection lifecycle ─── */

  private async createPeerConnection(userId: string, createOffer: boolean): Promise<PeerInfo> {
    if (this.peers.has(userId)) return this.peers.get(userId)!;

    const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const peerInfo: PeerInfo = { userId, connection, dataChannel: null, mediaStream: null };
    this.peers.set(userId, peerInfo);

    this.notifyStateChange(userId, 'connecting');

    // ICE candidates
    connection.onicecandidate = (e) => {
      if (e.candidate) {
        this.signaling.send({
          type: 'ice-candidate',
          roomId: this.roomId,
          userId: this.localUserId,
          targetUserId: userId,
          payload: e.candidate.toJSON(),
        });
      }
    };

    // Connection state
    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      if (state === 'connected') this.notifyStateChange(userId, 'connected');
      else if (state === 'disconnected') this.notifyStateChange(userId, 'reconnecting');
      else if (state === 'failed') {
        this.notifyStateChange(userId, 'failed');
        this.handleReconnect(userId);
      }
    };

    // Remote media
    connection.ontrack = (e) => {
      peerInfo.mediaStream = e.streams[0] ?? null;
      if (peerInfo.mediaStream) {
        this.mediaHandlers.forEach((h) => h(userId, peerInfo.mediaStream!));
      }
    };

    // Add local media if available
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        connection.addTrack(track, this.localStream);
      }
    }

    if (createOffer) {
      // Create data channel
      const dc = connection.createDataChannel('pomomate', { ordered: true });
      peerInfo.dataChannel = dc;
      this.setupDataChannel(dc, userId);

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      this.signaling.send({
        type: 'offer',
        roomId: this.roomId,
        userId: this.localUserId,
        targetUserId: userId,
        payload: offer,
      });
    } else {
      // Wait for data channel from remote
      connection.ondatachannel = (e) => {
        peerInfo.dataChannel = e.channel;
        this.setupDataChannel(e.channel, userId);
      };
    }

    return peerInfo;
  }

  private setupDataChannel(dc: RTCDataChannel, userId: string): void {
    dc.onmessage = (e) => {
      try {
        const msg: DataChannelMessage = JSON.parse(e.data);
        this.dataHandlers.forEach((h) => h(msg));
      } catch {
        logger.warn('[PeerManager] Failed to parse data channel message');
      }
    };

    dc.onopen = () => {
      logger.info(`[PeerManager] DataChannel open with ${userId}`);
      // If host, send current room state to new peer
      if (this.isHost) {
        this.sendRoomStateToNewPeer(userId);
      }
    };
  }

  private async handleOffer(userId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const peer = await this.createPeerConnection(userId, false);
    await peer.connection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    this.signaling.send({
      type: 'answer',
      roomId: this.roomId,
      userId: this.localUserId,
      targetUserId: userId,
      payload: answer,
    });
  }

  private async handleAnswer(userId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.connection.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private removePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (!peer) return;
    peer.dataChannel?.close();
    peer.connection.close();
    this.peers.delete(userId);
    this.notifyStateChange(userId, 'disconnected');
  }

  private handleReconnect(userId: string): void {
    this.removePeer(userId);
    // Will reconnect on next signaling presence update
    logger.info(`[PeerManager] Peer ${userId} failed, will reconnect on next presence`);
  }

  private sendRoomStateToNewPeer(_userId: string): void {
    // Host sends full room state over data channel — implemented by feature handlers
    // The feature registry dispatches this
  }

  private notifyStateChange(userId: string, state: ConnectionState): void {
    this.stateHandlers.forEach((h) => h(userId, state));
  }

  closeAll(): void {
    for (const [userId] of this.peers) {
      this.removePeer(userId);
    }
  }
}
