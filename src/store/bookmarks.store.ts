import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileEntity } from '@/types/file';

interface BookmarksStore {
  bookmarksByUser: Record<string, FileEntity[]>;
  addBookmark: (userId: string, file: FileEntity) => void;
  removeBookmark: (userId: string, fileId: string) => void;

  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set) => ({
      bookmarksByUser: {},

      addBookmark: (userId, file) =>
        set((s) => ({
          bookmarksByUser: {
            ...s.bookmarksByUser,
            [userId]: [file, ...(s.bookmarksByUser[userId] ?? []).filter((f) => f.id !== file.id)],
          },
        })),

      removeBookmark: (userId, fileId) =>
        set((s) => ({
          bookmarksByUser: {
            ...s.bookmarksByUser,
            [userId]: (s.bookmarksByUser[userId] ?? []).filter((f) => f.id !== fileId),
          },
        })),

      panelOpen: false,
      openPanel: () => set({ panelOpen: true }),
      closePanel: () => set({ panelOpen: false }),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
    }),
    {
      name: 'metasphere-bookmarks',
      // Only persist bookmark data, not the panel open state
      partialize: (s) => ({ bookmarksByUser: s.bookmarksByUser }),
    }
  )
);
