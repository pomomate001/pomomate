/**
 * Chat store — in-room messaging state.
 *
 * Holds messages for the active room. Transport (WebRTC data channel in M04 /
 * backend persistence in M03) feeds messages into this store via `addMessage`.
 */
import { create } from 'zustand';
import type { Message } from '../types';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) =>
      state.messages.some((m) => m.id === message.id)
        ? state
        : { messages: [...state.messages, message] },
    ),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clear: () => set({ messages: [], isLoading: false, error: null }),
}));
