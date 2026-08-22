/**
 * WebRTC signaling server + presence over WebSocket.
 *
 * Handles:
 *  - Room join/leave notifications
 *  - SDP offer/answer relay
 *  - ICE candidate relay
 *  - Presence (online status)
 *
 * The server does NOT carry media traffic (host-authoritative P2P model).
 */
import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import { adminClient } from '../supabase.js';

interface SignalingMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate' | 'presence' | 'error';
  roomId?: string;
  userId?: string;
  targetUserId?: string;
  payload?: unknown;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  roomId: string | null;
}

const clients = new Map<WebSocket, ConnectedClient>();
const rooms = new Map<string, Set<WebSocket>>();

export function setupSignaling(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: '/ws/signaling' });

  wss.on('connection', (ws, req) => {
    const client: ConnectedClient = { ws, userId: '', roomId: null };
    clients.set(ws, client);

    ws.on('message', async (raw) => {
      try {
        const msg: SignalingMessage = JSON.parse(raw.toString());
        await handleMessage(ws, client, msg);
      } catch {
        sendTo(ws, { type: 'error', payload: 'Invalid message' });
      }
    });

    ws.on('close', () => {
      handleLeave(ws, client);
      clients.delete(ws);
    });
  });
}

async function handleMessage(
  ws: WebSocket,
  client: ConnectedClient,
  msg: SignalingMessage,
): Promise<void> {
  switch (msg.type) {
    case 'join': {
      if (!msg.roomId || !msg.userId) {
        sendTo(ws, { type: 'error', payload: 'roomId and userId required' });
        return;
      }

      // Verify user is a member of the room via Supabase
      const { data } = await adminClient
        .from('room_members')
        .select('id')
        .eq('room_id', msg.roomId)
        .eq('user_id', msg.userId)
        .single();

      if (!data) {
        sendTo(ws, { type: 'error', payload: 'Not a room member' });
        return;
      }

      client.userId = msg.userId;
      client.roomId = msg.roomId;

      // Add to room
      if (!rooms.has(msg.roomId)) rooms.set(msg.roomId, new Set());
      rooms.get(msg.roomId)!.add(ws);

      // Notify others
      broadcastToRoom(msg.roomId, ws, {
        type: 'join',
        roomId: msg.roomId,
        userId: msg.userId,
      });

      // Send presence of existing members
      const members = getOnlineMembers(msg.roomId);
      sendTo(ws, { type: 'presence', roomId: msg.roomId, payload: members });
      break;
    }

    case 'leave':
      handleLeave(ws, client);
      break;

    case 'offer':
    case 'answer':
    case 'ice-candidate': {
      // Relay to target user
      if (!msg.targetUserId || !client.roomId) return;
      const target = findClientInRoom(client.roomId, msg.targetUserId);
      if (target) {
        sendTo(target, {
          type: msg.type,
          roomId: client.roomId,
          userId: client.userId,
          payload: msg.payload,
        });
      }
      break;
    }
  }
}

function handleLeave(ws: WebSocket, client: ConnectedClient): void {
  if (!client.roomId) return;

  const roomSet = rooms.get(client.roomId);
  if (roomSet) {
    roomSet.delete(ws);
    if (roomSet.size === 0) rooms.delete(client.roomId);
  }

  broadcastToRoom(client.roomId, ws, {
    type: 'leave',
    roomId: client.roomId,
    userId: client.userId,
  });

  client.roomId = null;
}

function broadcastToRoom(roomId: string, excludeWs: WebSocket, msg: SignalingMessage): void {
  const roomSet = rooms.get(roomId);
  if (!roomSet) return;
  const data = JSON.stringify(msg);
  for (const ws of roomSet) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function sendTo(ws: WebSocket, msg: SignalingMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function findClientInRoom(roomId: string, userId: string): WebSocket | null {
  const roomSet = rooms.get(roomId);
  if (!roomSet) return null;
  for (const ws of roomSet) {
    const c = clients.get(ws);
    if (c && c.userId === userId) return ws;
  }
  return null;
}

function getOnlineMembers(roomId: string): string[] {
  const roomSet = rooms.get(roomId);
  if (!roomSet) return [];
  const members: string[] = [];
  for (const ws of roomSet) {
    const c = clients.get(ws);
    if (c?.userId) members.push(c.userId);
  }
  return members;
}
