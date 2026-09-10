import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { roomService } from '../RoomService';
import { supabase } from '../../auth/supabaseClient';

const mockSend = jest.fn();
const mockSubscribe = jest.fn((cb: any) => {
  cb('SUBSCRIBED');
  return { unsubscribe: jest.fn() };
});

const mockChannel = {
  state: 'joined',
  topic: 'realtime:room_settings_room-123',
  send: mockSend,
  subscribe: mockSubscribe,
};

jest.mock('../../auth/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    getChannels: jest.fn(),
    channel: jest.fn(),
  },
}));

describe('RoomService - Settings & Moderation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.getChannels as jest.Mock).mockReturnValue([mockChannel]);
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
  });

  describe('broadcastRoomSettings', () => {
    it('broadcasts settings update over realtime channel', async () => {
      const settings = { allowMic: false, allowCamera: true, allowFiles: false, allowChat: true };
      await roomService.broadcastRoomSettings('room-123', settings);

      expect(mockSend).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'settings_update',
        payload: settings,
      });
    });
  });

  describe('kickParticipant', () => {
    it('deletes member, adds to kicked list and broadcasts kick event', async () => {
      const deleteEqMock = jest.fn<any>().mockResolvedValue({ error: null });
      const deleteFilterMock = { eq: jest.fn<any>().mockReturnValue({ eq: deleteEqMock }) };

      const selectSingleMock = jest.fn<any>().mockResolvedValue({
        data: { settings: { allowMic: true, kickedUserIds: ['old-user'] } },
      });
      const selectEqMock = { eq: jest.fn<any>().mockReturnValue({ maybeSingle: selectSingleMock }) };

      const updateEqMock = jest.fn<any>().mockResolvedValue({ error: null });
      const updateFilterMock = { eq: updateEqMock };

      (supabase.from as any).mockImplementation((table: any) => {
        if (table === 'room_members') {
          return {
            delete: jest.fn().mockReturnValue(deleteFilterMock),
          };
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue(selectEqMock),
            update: jest.fn().mockReturnValue(updateFilterMock),
          };
        }
        return {};
      });

      const result = await roomService.kickParticipant('room-123', 'kicked-user-456');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();

      // Check member deletion
      expect(deleteFilterMock.eq).toHaveBeenCalledWith('room_id', 'room-123');

      // Check kickedUserIds appended
      expect(updateFilterMock.eq).toHaveBeenCalledWith('id', 'room-123');

      // Check broadcast
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'broadcast',
          event: 'kick_participant',
          payload: expect.objectContaining({
            roomId: 'room-123',
            userId: 'kicked-user-456',
          }),
        }),
      );
    });
  });

  describe('joinRoom with kicked user', () => {
    it('rejects joining when userId is in kickedUserIds', async () => {
      const selectSingleMock = jest.fn<any>().mockResolvedValue({
        data: {
          id: 'room-123',
          name: 'Test Room',
          host_id: 'host-1',
          invite_code: 'TEST99',
          max_members: 6,
          is_active: true,
          settings: {
            kickedUserIds: ['banned-user-1'],
          },
        },
        error: null,
      });

      const selectMock = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: selectSingleMock,
      };

      (supabase.from as any).mockImplementation((table: any) => {
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue(selectMock),
          };
        }
        return {};
      });

      const result = await roomService.joinRoom('TEST99', 'banned-user-1');

      expect(result.room).toBeNull();
      expect(result.error).toContain('çıkarıldınız');
    });
  });
});
