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
import type { PeerInfo, DataChannelMessage, ConnectionState, SignalingMessage, RoomUserProfile } from './types';
import type { ScreenQuality } from './AdaptiveQualityController';
import { useRoomStore } from '../../state';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, type MediaStream } from 'react-native-webrtc';


const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN servers can be added here for NAT traversal
];

type DataMessageHandler = (msg: DataChannelMessage) => void;
type MediaStreamHandler = (userId: string, stream: MediaStream) => void;
type StateChangeHandler = (userId: string, state: ConnectionState) => void;

function setSdpBitrate(sdp: string, bitrateKbps: number = 2500): string {
  if (!sdp || !sdp.includes('m=video')) return sdp;
  if (sdp.includes('b=AS:')) {
    return sdp.replace(/b=AS:\d+/g, `b=AS:${bitrateKbps}`).replace(/b=TIAS:\d+/g, `b=TIAS:${bitrateKbps * 1000}`);
  }
  return sdp.replace(/(m=video[^\r\n]+[\r\n]+)/g, `$1b=AS:${bitrateKbps}\r\nb=TIAS:${bitrateKbps * 1000}\r\n`);
}

export class PeerManager {
  private peers = new Map<string, PeerInfo>();
  private signaling: SignalingClient;
  private localUserId: string;
  private roomId: string;
  private isHost: boolean;
  private userProfile?: RoomUserProfile;
  private peerProfiles = new Map<string, RoomUserProfile>();
  private currentVideoProfile: ScreenQuality = '1080p';
  private localStream: MediaStream | null = null;

  private dataHandlers = new Set<DataMessageHandler>();
  private mediaHandlers = new Set<MediaStreamHandler>();
  private stateHandlers = new Set<StateChangeHandler>();

  constructor(
    signaling: SignalingClient,
    localUserId: string,
    roomId: string,
    isHost: boolean,
    userProfile?: RoomUserProfile,
  ) {
    this.signaling = signaling;
    this.localUserId = localUserId;
    this.roomId = roomId;
    this.isHost = isHost;
    this.userProfile = userProfile;

    this.signaling.onMessage(this.handleSignalingMessage.bind(this));
  }

  /* ─── Public API ─── */

  /** Join the signaling room and start peer connections. */
  joinRoom(): void {
    this.signaling.send({
      type: 'join',
      roomId: this.roomId,
      userId: this.localUserId,
      payload: this.userProfile ? {
        displayName: this.userProfile.displayName,
        avatarUrl: this.userProfile.avatarUrl,
      } : undefined,
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
  async setLocalStream(stream: MediaStream | null): Promise<void> {
    this.localStream = stream;
    if (!stream) {
      for (const peer of this.peers.values()) {
        const senders = peer.connection.getSenders();
        for (const s of senders) {
          if (s.track) {
            try {
              s.track.stop();
              await s.replaceTrack(null);
            } catch (err) {
              logger.warn('[PeerManager] Error clearing sender track:', err);
            }
          }
        }
      }
      return;
    }

    for (const peer of this.peers.values()) {
      const senders = peer.connection.getSenders();
      let renegotiateNeeded = false;

      for (const track of stream.getTracks()) {
        const kind = track.kind;
        let sender = senders.find((s) => s.track && s.track.kind === kind);
        if (sender) {
          try {
            await sender.replaceTrack(track);
          } catch (e) {
            logger.warn('[PeerManager] replaceTrack error:', e);
          }
        } else {
          try {
            sender = peer.connection.addTrack(track, stream);
            renegotiateNeeded = true;
          } catch (e) {
            logger.warn('[PeerManager] addTrack error:', e);
          }
        }

        if (kind === 'video' && sender) {
          await this.optimizeVideoSender(sender);
        }
      }

      if (renegotiateNeeded) {
        await this.renegotiatePeer(peer);
      }
    }
  }

  getPeerProfile(userId: string): RoomUserProfile | undefined {
    return this.peerProfiles.get(userId);
  }

  async setVideoEncodingProfile(profile: ScreenQuality): Promise<void> {
    this.currentVideoProfile = profile;
    for (const peer of this.peers.values()) {
      if (peer.connection && typeof peer.connection.getSenders === 'function') {
        const senders = peer.connection.getSenders();
        for (const sender of senders) {
          if (sender.track && sender.track.kind === 'video') {
            await this.optimizeVideoSender(sender, profile);
          }
        }
      }
    }
  }

  async getPeerTelemetry(): Promise<{ avgRtt: number; packetLossRatio: number }> {
    let totalRtt = 0;
    let rttCount = 0;
    let totalLost = 0;
    let totalSent = 0;

    for (const peer of this.peers.values()) {
      if (!peer.connection || typeof peer.connection.getStats !== 'function') continue;
      try {
        const stats = await peer.connection.getStats();
        if (stats && typeof stats.forEach === 'function') {
          stats.forEach((report: any) => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded' && typeof report.currentRoundTripTime === 'number') {
              totalRtt += report.currentRoundTripTime;
              rttCount++;
            }
            if (report.type === 'outbound-rtp' && report.kind === 'video') {
              if (typeof report.packetsSent === 'number') totalSent += report.packetsSent;
            }
            if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
              if (typeof report.packetsLost === 'number') totalLost += report.packetsLost;
            }
          });
        }
      } catch {
        // Ignored
      }
    }

    return {
      avgRtt: rttCount > 0 ? totalRtt / rttCount : 0,
      packetLossRatio: totalSent > 0 ? totalLost / totalSent : 0,
    };
  }

  private async optimizeVideoSender(sender: any, profile: ScreenQuality = this.currentVideoProfile): Promise<void> {
    if (!sender || typeof sender.getParameters !== 'function') return;
    try {
      const params = sender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }
      if (profile === '1080p') {
        params.encodings[0].maxBitrate = 2500000;
        params.encodings[0].minBitrate = 800000;
        params.encodings[0].maxFramerate = 30;
        params.encodings[0].scaleResolutionDownBy = 1.0;
      } else {
        params.encodings[0].maxBitrate = 1200000;
        params.encodings[0].minBitrate = 400000;
        params.encodings[0].maxFramerate = 24;
        params.encodings[0].scaleResolutionDownBy = 1.5;
      }
      (params as any).degradationPreference = 'maintain-resolution';
      if (typeof sender.setParameters === 'function') {
        await sender.setParameters(params);
      }
    } catch {
      // Platform may gracefully ignore custom params
    }
  }

  private async renegotiatePeer(peer: PeerInfo): Promise<void> {
    try {
      const offer = await peer.connection.createOffer({});
      const enhancedOffer = offer.sdp
        ? new RTCSessionDescription({ type: offer.type, sdp: setSdpBitrate(offer.sdp, 2500) })
        : offer;
      await peer.connection.setLocalDescription(enhancedOffer);
      this.signaling.send({
        type: 'offer',
        roomId: this.roomId,
        userId: this.localUserId,
        targetUserId: peer.userId,
        payload: enhancedOffer,
      });
    } catch (err) {
      logger.warn('[PeerManager] Renegotiation failed:', err);
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
    if (msg.userId === this.localUserId) return; // Prevent self-broadcast loopback
    if (msg.targetUserId && msg.targetUserId !== this.localUserId) return; // Ignore messages intended for others

    switch (msg.type) {
      case 'join':
        if (msg.userId && msg.userId !== this.localUserId) {
          if (msg.payload && typeof msg.payload === 'object') {
            const profile = msg.payload as RoomUserProfile;
            this.peerProfiles.set(msg.userId, profile);
            useRoomStore.getState().addMember({
              id: msg.userId,
              roomId: this.roomId,
              userId: msg.userId,
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
              role: 'member',
              joinedAt: new Date().toISOString(),
            });
          }
          // If previous peer connection exists for this user, clean up first
          if (this.peers.has(msg.userId)) {
            this.removePeer(msg.userId);
          }
          await this.createPeerConnection(msg.userId, true);
        }
        break;

      case 'leave':
        if (msg.userId) this.removePeer(msg.userId);
        break;

      case 'offer':
        if (msg.userId) await this.handleOffer(msg.userId, msg.payload);
        break;

      case 'answer':
        if (msg.userId) await this.handleAnswer(msg.userId, msg.payload);
        break;

      case 'ice-candidate':
        if (msg.userId) await this.handleIceCandidate(msg.userId, msg.payload);
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
    if (this.peers.has(userId)) {
      const existing = this.peers.get(userId)!;
      const state = existing.connection.connectionState;
      if (state === 'connected' && !createOffer) {
        return existing;
      }
      this.removePeer(userId);
    }

    const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const peerInfo: PeerInfo = { userId, connection, dataChannel: null, mediaStream: null };
    this.peers.set(userId, peerInfo);

    this.notifyStateChange(userId, 'connecting');

    // Attach local media stream tracks (camera/mic/screen) immediately
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        try {
          const sender = connection.addTrack(track, this.localStream);
          if (track.kind === 'video' && sender) {
            void this.optimizeVideoSender(sender);
          }
        } catch (err) {
          logger.warn('[PeerManager] Error adding track to connection:', err);
        }
      }
    }

    // ICE candidates
    connection.onicecandidate = (e: any) => {
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
      const state = connection.connectionState as ConnectionState;
      this.notifyStateChange(userId, state);

      if (state === 'disconnected' || state === 'failed') {
        this.removePeer(userId);
      }
    };

    // Remote stream
    connection.ontrack = (e: any) => {
      peerInfo.mediaStream = e.streams[0] ?? null;
      if (peerInfo.mediaStream) {
        this.mediaHandlers.forEach((h) => h(userId, peerInfo.mediaStream!));
      }
    };

    // Data Channel (Initiator creates it)
    if (createOffer) {
      const dc = connection.createDataChannel('pomo-sync');
      peerInfo.dataChannel = dc as any;
      this.setupDataChannel(dc, userId);

      const offer = await connection.createOffer({});
      const enhancedOffer = offer.sdp
        ? new RTCSessionDescription({ type: offer.type, sdp: setSdpBitrate(offer.sdp, 2500) })
        : offer;
      await connection.setLocalDescription(enhancedOffer);
      this.signaling.send({
        type: 'offer',
        roomId: this.roomId,
        userId: this.localUserId,
        targetUserId: userId,
        payload: enhancedOffer,
      });
    } else {
      // Wait for data channel from remote
      connection.ondatachannel = (e: any) => {
        peerInfo.dataChannel = e.channel as any;
        this.setupDataChannel(e.channel as any, userId);
      };
    }

    return peerInfo;
  }

  private setupDataChannel(dc: any, userId: string): void {
    dc.onmessage = (e: any) => {
      try {
        const msg: DataChannelMessage = JSON.parse(e.data);
        if (msg.type === 'presence-update' && msg.payload && typeof msg.payload === 'object') {
          const profile = msg.payload as RoomUserProfile;
          this.peerProfiles.set(msg.senderId, profile);
          useRoomStore.getState().addMember({
            id: msg.senderId,
            roomId: this.roomId,
            userId: msg.senderId,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            role: 'member',
            joinedAt: new Date().toISOString(),
          });
        }
        this.dataHandlers.forEach((h) => h(msg));
      } catch {
        logger.warn('[PeerManager] Failed to parse data channel message');
      }
    };

    dc.onopen = () => {
      logger.info(`[PeerManager] DataChannel open with ${userId}`);
      // Announce profile to the connected peer
      if (this.userProfile) {
        this.sendTo(userId, {
          type: 'presence-update',
          payload: this.userProfile,
        });
      }
      // If host, send current room state to new peer
      if (this.isHost) {
        this.sendRoomStateToNewPeer(userId);
      }
    };
  }

  private async handleOffer(userId: string, sdp: any): Promise<void> {
    const peer = await this.createPeerConnection(userId, false);
    await peer.connection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.connection.createAnswer();
    const enhancedAnswer = answer.sdp
      ? new RTCSessionDescription({ type: answer.type, sdp: setSdpBitrate(answer.sdp, 2500) })
      : answer;
    await peer.connection.setLocalDescription(enhancedAnswer);
    this.signaling.send({
      type: 'answer',
      roomId: this.roomId,
      userId: this.localUserId,
      targetUserId: userId,
      payload: enhancedAnswer as any,
    });
  }

  private async handleAnswer(userId: string, sdp: any): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.connection.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIceCandidate(userId: string, candidate: any): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;
    await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private removePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (!peer) return;
    try {
      peer.dataChannel?.close();
    } catch {}
    try {
      peer.connection.close();
    } catch {}
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
