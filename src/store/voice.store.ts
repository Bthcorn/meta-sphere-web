import { create } from 'zustand';

interface VoiceState {
  /** IDs of participants currently detected as speaking. */
  speakingUserIds: Set<string>;
  setSpeakingUserIds: (ids: Set<string>) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  speakingUserIds: new Set(),
  setSpeakingUserIds: (ids) => set({ speakingUserIds: ids }),
}));
