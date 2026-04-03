import { create } from 'zustand';
import type { FileEntity } from '@/types/file';

interface SessionFilesStore {
  // ── File list ─────────────────────────────────────────────────────────────
  filesBySession: Record<string, FileEntity[]>;
  setFiles: (sessionId: string, files: FileEntity[]) => void;
  addFile: (sessionId: string, file: FileEntity) => void;
  removeFile: (sessionId: string, fileId: string) => void;
  clearSession: (sessionId: string) => void;

  // ── Unread badge ──────────────────────────────────────────────────────────
  // True when a new file arrived while the tray was collapsed
  unreadBySession: Record<string, boolean>;
  markSeen: (sessionId: string) => void;

  // ── Tray open state ───────────────────────────────────────────────────────
  trayOpen: boolean;
  openTray: () => void;
  closeTray: () => void;
  toggleTray: () => void;

  // ── Upload progress (reuse same pattern as library) ───────────────────────
  uploadProgress: number;
  setUploadProgress: (p: number) => void;
  resetUploadProgress: () => void;
}

export const useSessionFilesStore = create<SessionFilesStore>()((set) => ({
  filesBySession: {},

  setFiles: (sessionId, files) =>
    set((s) => ({
      filesBySession: { ...s.filesBySession, [sessionId]: files },
    })),

  addFile: (sessionId, file) =>
    set((s) => {
      const prev = s.filesBySession[sessionId] ?? [];
      // Deduplicate by id
      if (prev.some((f) => f.id === file.id)) return s;
      return {
        filesBySession: { ...s.filesBySession, [sessionId]: [...prev, file] },
        // Mark as unread only if tray is currently closed
        unreadBySession: s.trayOpen
          ? s.unreadBySession
          : { ...s.unreadBySession, [sessionId]: true },
      };
    }),

  removeFile: (sessionId, fileId) =>
    set((s) => ({
      filesBySession: {
        ...s.filesBySession,
        [sessionId]: (s.filesBySession[sessionId] ?? []).filter((f) => f.id !== fileId),
      },
    })),

  clearSession: (sessionId) =>
    set((s) => {
      const files = { ...s.filesBySession };
      const unread = { ...s.unreadBySession };
      delete files[sessionId];
      delete unread[sessionId];
      return { filesBySession: files, unreadBySession: unread };
    }),

  unreadBySession: {},
  markSeen: (sessionId) =>
    set((s) => ({
      unreadBySession: { ...s.unreadBySession, [sessionId]: false },
    })),

  trayOpen: false,
  openTray: () => set({ trayOpen: true }),
  closeTray: () => set({ trayOpen: false }),
  toggleTray: () => set((s) => ({ trayOpen: !s.trayOpen })),

  uploadProgress: 0,
  setUploadProgress: (p) => set({ uploadProgress: p }),
  resetUploadProgress: () => set({ uploadProgress: 0 }),
}));
