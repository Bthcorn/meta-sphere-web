import { create } from 'zustand';

interface ScreenShareState {
  stream: MediaStream | null;
  sharerName: string | null;
  isLocal: boolean;
  isMinimized: boolean;

  setStream: (stream: MediaStream, sharerName: string, isLocal: boolean) => void;
  clearStream: () => void;
  setMinimized: (v: boolean) => void;
}

export const useScreenShareStore = create<ScreenShareState>((set) => ({
  stream: null,
  sharerName: null,
  isLocal: false,
  isMinimized: false,
  setStream: (stream, sharerName, isLocal) =>
    set({ stream, sharerName, isLocal, isMinimized: false }),
  clearStream: () => set({ stream: null, sharerName: null, isLocal: false, isMinimized: false }),
  setMinimized: (v) => set({ isMinimized: v }),
}));
