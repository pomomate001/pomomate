/**
 * WebSocket-based signaling client.
 *
 * Connects to the server signaling endpoint (/ws/signaling)
 * and relays SDP offers/answers and ICE candidates between peers.
 */
import { logger } from '../../utils/logger';
import type { SignalingMessage } from './types';
import { supabase } from '../auth/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type MessageHandler = (msg: SignalingMessage) => void;

export class SignalingClient {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private handlers = new Set<MessageHandler>();
  private isConnectedFlag = false;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  connect(): void {
    if (this.channel) return;

    this.channel = supabase.channel(`room_signaling_${this.roomId}`, {
      config: {
        broadcast: { ack: false },
      },
    });

    this.channel
      .on('broadcast', { event: 'signaling' }, (payload) => {
        try {
          const msg = payload.payload as SignalingMessage;
          this.handlers.forEach((h) => h(msg));
        } catch {
          logger.warn('[Signaling] Failed to parse broadcast message');
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnectedFlag = true;
          logger.info(`[Signaling] Connected to Supabase channel for room ${this.roomId}`);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnectedFlag = false;
          logger.warn(`[Signaling] Disconnected from Supabase channel for room ${this.roomId}, status: ${status}`);
        }
      });
  }

  send(msg: SignalingMessage): void {
    if (this.isConnectedFlag && this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: msg,
      });
    } else {
      logger.warn('[Signaling] Cannot send message, not connected.');
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.isConnectedFlag = false;
    logger.info(`[Signaling] Disconnected from room ${this.roomId}`);
  }

  get isConnected(): boolean {
    return this.isConnectedFlag;
  }
}
