/**
 * Supabase-backed Room Service.
 * 
 * Handles real-time creation, joining, member management,
 * and persistence for shared Pomodoro study rooms.
 */
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';
import type { Room } from '../../types';

function generateRandomInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomService {
  /**
   * Create a new room in Supabase.
   */
  async createRoom(name: string, hostId: string): Promise<{ room: Room | null; error: string | null }> {
    try {
      const inviteCode = generateRandomInviteCode();

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name,
          host_id: hostId,
          invite_code: inviteCode,
          max_members: 6,
          is_active: true,
        })
        .select()
        .single();

      if (roomError || !roomData) {
        logger.warn('[RoomService] createRoom error:', roomError?.message);
        return { room: null, error: roomError?.message || 'Oda oluşturulamadı' };
      }

      // Add host as first member in room_members table
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: roomData.id,
          user_id: hostId,
          role: 'host',
        });

      if (memberError) {
        logger.warn('[RoomService] Failed to add host to room_members:', memberError.message);
      }

      // Initialize room_state
      await supabase
        .from('room_state')
        .upsert({
          room_id: roomData.id,
          timer_mode: 'work',
          timer_remaining_seconds: 1500,
          timer_is_running: false,
          current_cycle: 1,
        });

      const room: Room = {
        id: roomData.id,
        name: roomData.name,
        hostId: roomData.host_id,
        maxMembers: roomData.max_members ?? 6,
        isActive: roomData.is_active,
        createdAt: roomData.created_at,
        inviteCode: roomData.invite_code,
      };

      return { room, error: null };
    } catch (err: any) {
      logger.warn('[RoomService] createRoom exception:', err);
      return { room: null, error: err?.message || 'Oda oluşturulurken bir hata oluştu.' };
    }
  }

  /**
   * Join an existing active room by invite code.
   */
  async joinRoom(code: string, userId: string): Promise<{ room: Room | null; error: string | null }> {
    try {
      const normalizedCode = code.trim().toUpperCase();

      // Find room in Supabase
      const { data: roomData, error: findError } = await supabase
        .from('rooms')
        .select('*')
        .eq('invite_code', normalizedCode)
        .eq('is_active', true)
        .maybeSingle();

      if (findError || !roomData) {
        logger.warn('[RoomService] Room not found by code:', normalizedCode, findError?.message);
        return { room: null, error: 'Bu koda sahip aktif bir çalışma odası bulunamadı.' };
      }

      // Check current members count
      const { count } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id);

      if ((count ?? 0) >= (roomData.max_members ?? 6)) {
        return { room: null, error: 'Bu çalışma odası maksimum katılımcı kapasitesine ulaştı.' };
      }

      // Add user to room_members if not already added
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomData.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingMember) {
        const { error: joinError } = await supabase
          .from('room_members')
          .insert({
            room_id: roomData.id,
            user_id: userId,
            role: 'member',
          });

        if (joinError) {
          logger.warn('[RoomService] joinRoom member insert error:', joinError.message);
        }
      }

      const room: Room = {
        id: roomData.id,
        name: roomData.name,
        hostId: roomData.host_id,
        maxMembers: roomData.max_members ?? 6,
        isActive: roomData.is_active,
        createdAt: roomData.created_at,
        inviteCode: roomData.invite_code,
      };

      return { room, error: null };
    } catch (err: any) {
      logger.warn('[RoomService] joinRoom exception:', err);
      return { room: null, error: err?.message || 'Odaya bağlanırken bir hata oluştu.' };
    }
  }

  /**
   * Leave or deactivate a room.
   */
  async leaveRoom(roomId: string, userId: string, isHost: boolean): Promise<void> {
    try {
      if (isHost) {
        // Deactivate room
        await supabase
          .from('rooms')
          .update({ is_active: false })
          .eq('id', roomId);
      } else {
        // Remove member
        await supabase
          .from('room_members')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', userId);
      }
    } catch (err) {
      logger.warn('[RoomService] leaveRoom error:', err);
    }
  }
}

export const roomService = new RoomService();
