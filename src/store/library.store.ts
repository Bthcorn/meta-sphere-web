import { create } from 'zustand';
import type { FileEntity, ListFilesFilter } from '@/types/file';

interface LibraryStore {
  // ── Viewer popup ──────────────────────────────────────────────────────────
  viewerFile: FileEntity | null;
  openViewer: (file: FileEntity) => void;
  closeViewer: () => void;

  // ── Upload ────────────────────────────────────────────────────────────────
  uploadProgress: number; // 0 = idle, 1–99 = uploading, 100 = done
  setUploadProgress: (p: number) => void;
  resetUploadProgress: () => void;

  // ── Upload modal ──────────────────────────────────────────────────────────
  uploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;

  // ── Filters ───────────────────────────────────────────────────────────────
  filters: ListFilesFilter;
  setFilter: <K extends keyof ListFilesFilter>(key: K, value: ListFilesFilter[K]) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: ListFilesFilter = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useLibraryStore = create<LibraryStore>()((set) => ({
  viewerFile: null,
  openViewer: (file) => set({ viewerFile: file }),
  closeViewer: () => set({ viewerFile: null }),

  uploadProgress: 0,
  setUploadProgress: (p) => set({ uploadProgress: p }),
  resetUploadProgress: () => set({ uploadProgress: 0 }),

  uploadModalOpen: false,
  openUploadModal: () => set({ uploadModalOpen: true }),
  closeUploadModal: () => set({ uploadModalOpen: false }),

  filters: DEFAULT_FILTERS,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
