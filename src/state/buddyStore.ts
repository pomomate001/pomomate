import { create } from 'zustand';
import type { BuddySession, BuddyEmoji, TimerMode } from '../types';

export interface BuddyProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

interface BuddyState {
  activeSession: BuddySession | null;
  buddyProfile: BuddyProfile | null;
  myRole: 'host' | 'guest' | null;
  recentEmojis: BuddyEmoji[];
  pendingInvite: { sessionId: string; hostProfile: BuddyProfile } | null;
  isConnecting: boolean;
  error: string | null;
}

interface BuddyActions {
  setActiveSession: (session: BuddySession | null) => void;
  setBuddyProfile: (profile: BuddyProfile | null) => void;
  setMyRole: (role: 'host' | 'guest' | null) => void;
  addEmoji: (emoji: BuddyEmoji) => void;
  clearEmojis: () => void;
  setPendingInvite: (invite: { sessionId: string; hostProfile: BuddyProfile } | null) => void;
  updateTimerState: (patch: { timerMode?: TimerMode; timerDuration?: number; timerRemainingSeconds?: number; timerIsRunning?: boolean; currentCycle?: number }) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  endSession: () => void;
}

const initial: BuddyState = {
  activeSession: null,
  buddyProfile: null,
  myRole: null,
  recentEmojis: [],
  pendingInvite: null,
  isConnecting: false,
  error: null,
};

export const useBuddyStore = create<BuddyState & BuddyActions>((set) => ({
  ...initial,
  setActiveSession: (session) => set({ activeSession: session }),
  setBuddyProfile: (profile) => set({ buddyProfile: profile }),
  setMyRole: (role) => set({ myRole: role }),
  addEmoji: (emoji) => set((state) => ({
    recentEmojis: [...state.recentEmojis, emoji].slice(-5)
  })),
  clearEmojis: () => set({ recentEmojis: [] }),
  setPendingInvite: (invite) => set({ pendingInvite: invite }),
  updateTimerState: (patch) => set((state) => {
    if (!state.activeSession) return state;
    return {
      activeSession: {
        ...state.activeSession,
        ...patch,
      }
    };
  }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  endSession: () => set(initial),
}));
