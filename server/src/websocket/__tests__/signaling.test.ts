import { jest, describe, it, beforeAll, afterAll, afterEach, expect } from '@jest/globals';

const mockGetUser: any = jest.fn();
const mockFrom: any = jest.fn();

jest.unstable_mockModule('../../supabase.js', () => ({
  adminClient: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}));

// Dynamic imports are required after unstable_mockModule in ESM
let setupSignaling: any;
let createServer: any;
let WebSocket: any;

describe('Signaling Server', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    const http = await import('http');
    createServer = http.createServer;
    const wsModule = await import('ws');
    WebSocket = wsModule.WebSocket;
    
    const signalingModule = await import('../signaling.js');
    setupSignaling = signalingModule.setupSignaling;
  });

  beforeAll((done) => {
    server = createServer();
    setupSignaling(server);
    server.listen(0, () => {
      port = (server.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects connection without token', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws/signaling`);
    ws.on('close', (code: number) => {
      expect(code).toBe(4001);
      done();
    });
  });

  it('rejects connection with invalid token', (done) => {
    mockGetUser.mockResolvedValue({ error: new Error('Invalid token') });
    
    const ws = new WebSocket(`ws://localhost:${port}/ws/signaling?token=invalid`);
    ws.on('close', (code: number) => {
      expect(code).toBe(4001);
      done();
    });
  });

  it('accepts connection and handles join and leave', (done) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    
    // Mock room members check
    const mockEq2: any = jest.fn().mockReturnValue({ single: (jest.fn() as any).mockResolvedValue({ data: { id: 'rm-1' } }) });
    const mockEq1: any = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect: any = jest.fn().mockReturnValue({ eq: mockEq1 });
    mockFrom.mockReturnValue({ select: mockSelect });

    const ws1 = new WebSocket(`ws://localhost:${port}/ws/signaling?token=valid-token-1`);
    
    ws1.on('open', () => {
      ws1.send(JSON.stringify({ type: 'join', roomId: 'room-1' }));
    });

    ws1.on('message', (data: any) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'presence') {
        expect(msg.roomId).toBe('room-1');
        ws1.close();
      }
    });

    ws1.on('close', () => {
      done();
    });
  });
});
