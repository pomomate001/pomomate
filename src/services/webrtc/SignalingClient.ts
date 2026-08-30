/**
 * WebSocket-based signaling client.
 *
 * Connects to the server signaling endpoint (/ws/signaling)
 * and relays SDP offers/answers and ICE candidates between peers.
 */
import { logger } from '../../utils/logger';
import type { SignalingMessage } from './types';

type MessageHandler = (msg: SignalingMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers = new Set<MessageHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(url: string, token: string) {
    // Append token as query parameter
    const urlObj = new URL(url);
    urlObj.searchParams.set('token', token);
    this.url = urlObj.toString();
  }

  connect(): void {
    this.shouldReconnect = true;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      logger.info('[Signaling] Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: SignalingMessage = JSON.parse(event.data as string);
        this.handlers.forEach((h) => h(msg));
      } catch {
        logger.warn('[Signaling] Failed to parse message');
      }
    };

    this.ws.onclose = () => {
      logger.info('[Signaling] Disconnected');
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      logger.warn('[Signaling] WebSocket error');
    };
  }

  send(msg: SignalingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      logger.info('[Signaling] Attempting reconnect…');
      this.connect();
    }, 3000);
  }
}
