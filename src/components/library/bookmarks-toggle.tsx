import { Bookmark } from 'lucide-react';
import { useBookmarksStore } from '@/store/bookmarks.store';
import { useBookmarks } from '@/hooks/useBookmarks';

interface Props {
  /** Additional right-offset class, e.g. 'right-20'. Defaults to 'right-20'. */
  className?: string;
}

export function BookmarksToggle({ className = 'right-20' }: Props) {
  const panelOpen = useBookmarksStore((s) => s.panelOpen);
  const togglePanel = useBookmarksStore((s) => s.togglePanel);
  const { bookmarks } = useBookmarks();

  return (
    <button
      onClick={togglePanel}
      className={`pointer-events-auto absolute bottom-4 z-20
                  flex h-11 w-11 items-center justify-center rounded-full
                  border border-white/10 backdrop-blur-md transition-all
                  ${className}
                  ${
                    panelOpen
                      ? 'bg-yellow-500 text-white'
                      : 'bg-black/70 text-white/70 hover:bg-black/80 hover:text-white'
                  }`}
      title={panelOpen ? 'Close bookmarks' : 'My bookmarks'}
    >
      <Bookmark className={`size-4 ${panelOpen ? 'fill-white' : ''}`} />
      {!panelOpen && bookmarks.length > 0 && (
        <span
          className='absolute -right-1 -top-1 flex h-4 w-4 items-center
                     justify-center rounded-full bg-yellow-500 text-[9px]
                     font-bold text-white'
        >
          {bookmarks.length > 9 ? '9+' : bookmarks.length}
        </span>
      )}
    </button>
  );
}
