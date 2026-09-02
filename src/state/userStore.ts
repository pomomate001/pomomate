/**
 * User store — authenticated user state.
 *
 * Holds the current user and auth status. Sign-in/out flows and token handling
 * are implemented in M08 by wiring these actions to `AuthService`.
 */
import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth/SupabaseAuthService';
import { logger } from '../utils/logger';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsPasswordReset: boolean;

  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setNeedsPasswordReset: (needsReset: boolean) => void;
  signOut: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsPasswordReset: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  updateUser: async (patch) => {
    const currentUser = get().user;
    if (!currentUser) return;

    // 1. Update state immediately for instant UI responsiveness
    const updatedUser = { ...currentUser, ...patch };
    set({ user: updatedUser });

    // 2. Persist profile changes to Supabase database & auth
    if (currentUser.id && (patch.displayName !== undefined || patch.avatarUrl !== undefined)) {
      try {
        await authService.updateProfile(currentUser.id, {
          displayName: patch.displayName,
          avatarUrl: patch.avatarUrl,
        });
      } catch (e) {
        logger.warn('[UserStore] Failed to persist profile changes to Supabase:', e);
      }
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setNeedsPasswordReset: (needsPasswordReset) => set({ needsPasswordReset }),

  signOut: () =>
    set({ user: null, isAuthenticated: false, isLoading: false, error: null, needsPasswordReset: false }),
}));

