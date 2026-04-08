import { describe, it, expect, beforeEach } from 'vitest';
import { useBookmarksStore } from '../bookmarks.store';
import type { FileEntity } from '@/types/file';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
  return {
    id: 'file-1',
    name: 'notes.pdf',
    description: null,
    storageKey: 'uploads/notes.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    category: 'LECTURE_NOTES',
    tags: [],
    subject: null,
    yearLevel: null,
    isPublic: true,
    downloadCount: 0,
    roomId: 'room-1',
    sessionId: null,
    uploadedById: 'user-1',
    uploadedBy: { id: 'user-1', username: 'alice', firstName: 'Alice', lastName: 'A' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useBookmarksStore', () => {
  beforeEach(() => {
    useBookmarksStore.setState({ bookmarksByUser: {}, panelOpen: false });
  });

  // ── addBookmark ────────────────────────────────────────────────────────────

  describe('addBookmark', () => {
    it('adds a file for a user', () => {
      const file = makeFile();
      useBookmarksStore.getState().addBookmark('user-1', file);

      expect(useBookmarksStore.getState().bookmarksByUser['user-1']).toContainEqual(file);
    });

    it('does not duplicate a file already bookmarked', () => {
      const file = makeFile();
      useBookmarksStore.getState().addBookmark('user-1', file);
      useBookmarksStore.getState().addBookmark('user-1', file);

      expect(useBookmarksStore.getState().bookmarksByUser['user-1']).toHaveLength(1);
    });

    it('prepends the new bookmark (most recent first)', () => {
      const file1 = makeFile({ id: 'file-1' });
      const file2 = makeFile({ id: 'file-2' });
      useBookmarksStore.getState().addBookmark('user-1', file1);
      useBookmarksStore.getState().addBookmark('user-1', file2);

      const bookmarks = useBookmarksStore.getState().bookmarksByUser['user-1'];
      expect(bookmarks[0].id).toBe('file-2');
    });

    it('keeps bookmarks per-user isolated', () => {
      useBookmarksStore.getState().addBookmark('user-1', makeFile({ id: 'file-1' }));
      useBookmarksStore.getState().addBookmark('user-2', makeFile({ id: 'file-2' }));

      expect(useBookmarksStore.getState().bookmarksByUser['user-1']).toHaveLength(1);
      expect(useBookmarksStore.getState().bookmarksByUser['user-2']).toHaveLength(1);
    });
  });

  // ── removeBookmark ─────────────────────────────────────────────────────────

  describe('removeBookmark', () => {
    it('removes a file by id for a given user', () => {
      const file = makeFile();
      useBookmarksStore.getState().addBookmark('user-1', file);
      useBookmarksStore.getState().removeBookmark('user-1', 'file-1');

      expect(useBookmarksStore.getState().bookmarksByUser['user-1']).toHaveLength(0);
    });

    it('does not affect other users bookmarks', () => {
      const file = makeFile();
      useBookmarksStore.getState().addBookmark('user-1', file);
      useBookmarksStore.getState().addBookmark('user-2', file);
      useBookmarksStore.getState().removeBookmark('user-1', 'file-1');

      expect(useBookmarksStore.getState().bookmarksByUser['user-2']).toHaveLength(1);
    });

    it('leaves an empty array when the file was never bookmarked', () => {
      useBookmarksStore.getState().removeBookmark('user-1', 'non-existent');

      // removeBookmark falls back to `?? []` so it produces an empty array, not undefined
      expect(useBookmarksStore.getState().bookmarksByUser['user-1']).toEqual([]);
    });
  });

  // ── Panel state ────────────────────────────────────────────────────────────

  describe('panel open/close/toggle', () => {
    it('openPanel sets panelOpen to true', () => {
      useBookmarksStore.getState().openPanel();
      expect(useBookmarksStore.getState().panelOpen).toBe(true);
    });

    it('closePanel sets panelOpen to false', () => {
      useBookmarksStore.getState().openPanel();
      useBookmarksStore.getState().closePanel();
      expect(useBookmarksStore.getState().panelOpen).toBe(false);
    });

    it('togglePanel flips state each call', () => {
      expect(useBookmarksStore.getState().panelOpen).toBe(false);
      useBookmarksStore.getState().togglePanel();
      expect(useBookmarksStore.getState().panelOpen).toBe(true);
      useBookmarksStore.getState().togglePanel();
      expect(useBookmarksStore.getState().panelOpen).toBe(false);
    });
  });
});
