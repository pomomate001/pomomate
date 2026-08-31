import { create } from 'zustand';
import type { Tag } from '../types';

interface TagState {
  allTags: Tag[];
  userTags: Tag[];
  isLoading: boolean;
  error: string | null;
}

interface TagActions {
  setAllTags: (tags: Tag[]) => void;
  setUserTags: (tags: Tag[]) => void;
  addUserTag: (tag: Tag) => void;
  removeUserTag: (tagId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initial: TagState = {
  allTags: [],
  userTags: [],
  isLoading: false,
  error: null,
};

export const useTagStore = create<TagState & TagActions>((set) => ({
  ...initial,
  setAllTags: (tags) => set({ allTags: tags }),
  setUserTags: (tags) => set({ userTags: tags }),
  addUserTag: (tag) => set((state) => {
    if (state.userTags.length >= 8) return state;
    if (state.userTags.some(t => t.id === tag.id)) return state;
    return { userTags: [...state.userTags, tag] };
  }),
  removeUserTag: (tagId) => set((state) => ({
    userTags: state.userTags.filter(t => t.id !== tagId)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}));
