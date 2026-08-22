/**
 * Room store — collaborative room state.
 *
 * Tracks the currently joined room and its members. WebRTC connection state
 * (peers, media streams) is handled separately in M04; this store only owns
 * room metadata.
 */
import { create } from 'zustand';
import type { Room, RoomMember } from '../types';

interface RoomStore {
  currentRoom: Room | null;
  members: RoomMember[];
  isJoining: boolean;
  error: string | null;

  setCurrentRoom: (room: Room | null) => void;
  setMembers: (members: RoomMember[]) => void;
  addMember: (member: RoomMember) => void;
  removeMember: (memberId: string) => void;
  setJoining: (isJoining: boolean) => void;
  setError: (error: string | null) => void;
  leave: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoom: null,
  members: [],
  isJoining: false,
  error: null,

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
    set({ currentRoom: null, members: [], isJoining: false, error: null }),
}));
