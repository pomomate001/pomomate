/**
 * Friends store — friend list, requests, and friend stats.
 */
import { create } from 'zustand';

export interface FriendSummary {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalWorkSeconds: number;
  totalPomodoros: number;
  streak: number;
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

interface FriendsState {
  friends: FriendSummary[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
}

interface FriendsActions {
  setFriends: (friends: FriendSummary[]) => void;
  setIncomingRequests: (requests: FriendRequest[]) => void;
  setOutgoingRequests: (requests: FriendRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initial: FriendsState = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,
  error: null,
};

export const useFriendsStore = create<FriendsState & FriendsActions>((set) => ({
  ...initial,
  setFriends: (friends) => set({ friends }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  setOutgoingRequests: (outgoingRequests) => set({ outgoingRequests }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}));
