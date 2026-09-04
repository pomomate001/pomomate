/**
 * Room store — collaborative room state and room persistence.
 *
 * Tracks the currently joined room, its members, and persistent rooms list.
 */
import { create } from 'zustand';
import type { Room, RoomMember } from '../types';

/** Which content panels are visible in the active room. */
export interface ViewToggles {
  timer: boolean;
  screen: boolean;
  cameras: boolean;
}

export interface RoomSettings {
  allowCamera: boolean;
  allowMic: boolean;
  allowFiles: boolean;
  allowChat: boolean;
}

export interface SharedFile {
  id: string;
  uri: string;
  fileName: string;
  fileType: string; // 'image' | 'pdf' | 'other'
  sharedBy: string;
}

interface RoomStore {
  rooms: Room[];
  currentRoom: Room | null;
  members: RoomMember[];
  isJoining: boolean;
  error: string | null;

  viewToggles: ViewToggles;
  roomSettings: RoomSettings;
  
  sharedFiles: SharedFile[];
  activeSharedFileId: string | null;

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

  toggleView: (key: keyof ViewToggles) => void;
  setRoomSettings: (settings: Partial<RoomSettings>) => void;
  
  addSharedFile: (file: SharedFile) => void;
  setSharedFiles: (files: SharedFile[]) => void;
  removeSharedFile: (fileId: string) => void;
  setActiveSharedFileId: (fileId: string | null) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  currentRoom: null,
  members: [],
  isJoining: false,
  error: null,
  viewToggles: { timer: true, screen: false, cameras: false },
  roomSettings: { allowCamera: true, allowMic: true, allowFiles: true, allowChat: true },
  sharedFiles: [],
  activeSharedFileId: null,

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => {
      // Deduplicate by id AND by inviteCode (fixes the join-after-create duplicate bug)
      const isDuplicate = state.rooms.some(
        (r) =>
          r.id === room.id ||
          (room.inviteCode &&
            r.inviteCode &&
            r.inviteCode.toUpperCase() === room.inviteCode.toUpperCase()),
      );
      if (isDuplicate) {
        // Update existing room instead of adding a duplicate
        const updatedRooms = state.rooms.map((r) => {
          if (
            r.id === room.id ||
            (room.inviteCode &&
              r.inviteCode &&
              r.inviteCode.toUpperCase() === room.inviteCode.toUpperCase())
          ) {
            return { ...r, ...room, id: r.id }; // Keep original id
          }
          return r;
        });
        return { rooms: updatedRooms };
      }
      return { rooms: [room, ...state.rooms] };
    }),

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
    set((state) => {
      const existing = state.members.find((m) => m.id === member.id || m.userId === member.userId);
      if (existing) {
        return {
          members: state.members.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  displayName: member.displayName || m.displayName,
                  avatarUrl: member.avatarUrl !== undefined ? member.avatarUrl : m.avatarUrl,
                  role: member.role || m.role,
                }
              : m,
          ),
        };
      }
      return { members: [...state.members, member] };
    }),

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
          viewToggles: { timer: true, screen: false, cameras: false },
          roomSettings: { allowCamera: true, allowMic: true, allowFiles: true, allowChat: true },
          sharedFiles: [],
          activeSharedFileId: null,
        };
      }
      return {
        currentRoom: null,
        members: [],
        isJoining: false,
        error: null,
        viewToggles: { timer: true, screen: false, cameras: false },
        roomSettings: { allowCamera: true, allowMic: true, allowFiles: true, allowChat: true },
        sharedFiles: [],
        activeSharedFileId: null,
      };
    }),

  toggleView: (key) =>
    set((state) => ({
      viewToggles: {
        ...state.viewToggles,
        [key]: !state.viewToggles[key],
      },
    })),

  setRoomSettings: (settings) =>
    set((state) => ({
      roomSettings: { ...state.roomSettings, ...settings },
    })),
    
  addSharedFile: (file) =>
    set((state) => ({
      sharedFiles: state.sharedFiles.some((f) => f.id === file.id)
        ? state.sharedFiles.map((f) => (f.id === file.id ? file : f))
        : [...state.sharedFiles, file],
    })),
    
  setSharedFiles: (files) => set({ sharedFiles: files }),
    
  removeSharedFile: (fileId) =>
    set((state) => {
      const newFiles = state.sharedFiles.filter((f) => f.id !== fileId);
      return {
        sharedFiles: newFiles,
        activeSharedFileId: state.activeSharedFileId === fileId ? null : state.activeSharedFileId,
      };
    }),
    
  setActiveSharedFileId: (fileId) => set({ activeSharedFileId: fileId }),
}));

function patchActive(room: Room, isActive: boolean): Partial<Room> {
  return { isActive };
}
