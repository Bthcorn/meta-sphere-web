import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from '../useBookmarks';
import { useAuthStore } from '@/store/auth.store';
import { useBookmarksStore } from '@/store/bookmarks.store';
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

describe('useBookmarks', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'user-1', username: 'alice' },
      token: 'test-token',
      isAuthenticated: true,
    });
    useBookmarksStore.setState({ bookmarksByUser: {}, panelOpen: false });
  });

  it('returns empty bookmarks when none have been added', () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toEqual([]);
  });

  it('toggle adds a file that is not yet bookmarked', () => {
    const file = makeFile();
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.toggle(file);
    });

    expect(result.current.bookmarks).toContainEqual(file);
  });

  it('toggle removes a file that is already bookmarked', () => {
    const file = makeFile();
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.toggle(file);
    });
    act(() => {
      result.current.toggle(file);
    });

    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('isBookmarked returns true for a bookmarked file', () => {
    const file = makeFile();
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.toggle(file);
    });

    expect(result.current.isBookmarked('file-1')).toBe(true);
  });

  it('isBookmarked returns false for a non-bookmarked file', () => {
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.isBookmarked('file-99')).toBe(false);
  });

  it('uses the current user ID from auth store', () => {
    // Set up a different user
    useAuthStore.setState({
      user: { id: 'user-2', username: 'bob' },
      token: 'token-2',
      isAuthenticated: true,
    });
    // Seed a bookmark for user-1 that user-2 should NOT see
    useBookmarksStore.setState({
      bookmarksByUser: { 'user-1': [makeFile()] },
      panelOpen: false,
    });

    const { result } = renderHook(() => useBookmarks());
    expect(result.current.bookmarks).toEqual([]);
  });
});
