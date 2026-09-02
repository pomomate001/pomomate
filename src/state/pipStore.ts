import { create } from 'zustand';

interface PiPState {
  isInPiP: boolean;
  setIsInPiP: (isInPiP: boolean) => void;
}

export const usePiPStore = create<PiPState>((set) => ({
  isInPiP: false,
  setIsInPiP: (isInPiP) => set({ isInPiP }),
}));
