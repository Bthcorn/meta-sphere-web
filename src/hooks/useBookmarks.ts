import { useAuthStore } from '@/store/auth.store';
import { useBookmarksStore } from '@/store/bookmarks.store';
import type { FileEntity } from '@/types/file';

const EMPTY: FileEntity[] = [];

export function useBookmarks() {
  const userId = String(useAuthStore((s) => s.user?.id ?? ''));
  const bookmarksByUser = useBookmarksStore((s) => s.bookmarksByUser);
  const addBookmark = useBookmarksStore((s) => s.addBookmark);
  const removeBookmark = useBookmarksStore((s) => s.removeBookmark);

  const bookmarks = bookmarksByUser[userId] ?? EMPTY;

  const isBookmarked = (fileId: string) => bookmarks.some((f) => f.id === fileId);

  const toggle = (file: FileEntity) => {
    if (isBookmarked(file.id)) {
      removeBookmark(userId, file.id);
    } else {
      addBookmark(userId, file);
    }
  };

  return { bookmarks, isBookmarked, toggle };
}
