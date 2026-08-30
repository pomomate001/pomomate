/**
 * User store — authenticated user state.
 *
 * Holds the current user and auth status. Sign-in/out flows and token handling
 * are implemented in M08 by wiring these actions to `AuthService`.
 */
import { create } from 'zustand';
import type { User } from '../types';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsPasswordReset: boolean;

  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setNeedsPasswordReset: (needsReset: boolean) => void;
  signOut: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsPasswordReset: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  updateUser: (patch) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...patch } } : state,
    ),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setNeedsPasswordReset: (needsPasswordReset) => set({ needsPasswordReset }),

  signOut: () =>
    set({ user: null, isAuthenticated: false, isLoading: false, error: null, needsPasswordReset: false }),
}));
