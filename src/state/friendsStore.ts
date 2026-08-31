/**
 * Friends store — friend list, requests, and friend stats.
 */
import { create } from 'zustand';
import type { Tag } from '../types';

export interface FriendSummary {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalWorkSeconds: number;
  totalPomodoros: number;
  streak: number;
  tags?: Tag[];
  countryCode?: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarUrl?: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface SuggestedUser {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  countryCode?: string;
  tags: Tag[];
  matchingTagCount: number;
}

interface FriendsState {
  friends: FriendSummary[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  suggestedUsers: SuggestedUser[];
  blockedUserIds: string[];
  isLoading: boolean;
  error: string | null;
}

interface FriendsActions {
  setFriends: (friends: FriendSummary[]) => void;
  setIncomingRequests: (requests: FriendRequest[]) => void;
  setOutgoingRequests: (requests: FriendRequest[]) => void;
  setSuggestedUsers: (users: SuggestedUser[]) => void;
  setBlockedUserIds: (ids: string[]) => void;
  addBlockedUserId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initial: FriendsState = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  suggestedUsers: [],
  blockedUserIds: [],
  isLoading: false,
  error: null,
};

export const useFriendsStore = create<FriendsState & FriendsActions>((set) => ({
  ...initial,
  setFriends: (friends) => set({ friends }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  setOutgoingRequests: (outgoingRequests) => set({ outgoingRequests }),
  setSuggestedUsers: (suggestedUsers) => set({ suggestedUsers }),
  setBlockedUserIds: (blockedUserIds) => set({ blockedUserIds }),
  addBlockedUserId: (id) => set((state) => ({ blockedUserIds: [...state.blockedUserIds, id] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}));
