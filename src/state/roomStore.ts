/**
 * Room store — collaborative room state and room persistence.
 *
 * Tracks the currently joined room, its members, and persistent rooms list.
 */
import { create } from 'zustand';
import type { Room, RoomMember } from '../types';

interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  members: RoomMember[];
  isJoining: boolean;
  error: string | null;

  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, patch: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  setRoomActive: (roomId: string, isActive: boolean) => void;
  setCurrentRoom: (room: Room | null) => void;
  setMembers: (members: RoomMember[]) => void;
  addMember: (member: RoomMember) => void;
  removeMember: (memberId: string) => void;
  setJoining: (isJoining: boolean) => void;
  setError: (error: string | null) => void;
  leave: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  currentRoom: null,
  members: [],
  isJoining: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [room, ...state.rooms.filter((r) => r.id !== room.id)],
    })),

  updateRoom: (roomId, patch) =>
    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId ? { ...r, ...patch } : r,
      );
      const updatedCurrent =
        state.currentRoom?.id === roomId
          ? { ...state.currentRoom, ...patch }
          : state.currentRoom;
      return { rooms: updatedRooms, currentRoom: updatedCurrent };
    }),

  deleteRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== roomId),
      currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom,
    })),

  setRoomActive: (roomId, isActive) =>
    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId ? { ...r, ...patchActive(r, isActive) } : r,
      );
      const updatedCurrent =
        state.currentRoom?.id === roomId
          ? { ...state.currentRoom, isActive }
          : state.currentRoom;
      return { rooms: updatedRooms, currentRoom: updatedCurrent };
    }),

  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setMembers: (members) => set({ members }),

  addMember: (member) =>
    set((state) =>
      state.members.some((m) => m.id === member.id)
        ? state
        : { members: [...state.members, member] },
    ),

  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    })),

  setJoining: (isJoining) => set({ isJoining }),
  setError: (error) => set({ error }),

  leave: () =>
    set((state) => {
      if (state.currentRoom) {
        // Mark room as inactive when host leaves
        const updatedRooms = state.rooms.map((r) =>
          r.id === state.currentRoom?.id ? { ...r, isActive: false } : r,
        );
        return {
          rooms: updatedRooms,
          currentRoom: null,
          members: [],
          isJoining: false,
          error: null,
        };
      }
      return { currentRoom: null, members: [], isJoining: false, error: null };
    }),
}));

function patchActive(room: Room, isActive: boolean): Partial<Room> {
  return { isActive };
}
