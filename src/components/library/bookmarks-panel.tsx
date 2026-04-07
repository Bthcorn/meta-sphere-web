import { useState } from 'react';
import { Bookmark, X, Search, Eye, Download } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useBookmarksStore } from '@/store/bookmarks.store';
import { useLibraryStore } from '@/store/library.store';
import { useDownloadUrl } from '@/hooks/useLibrary';
import { CATEGORY_LABELS, CATEGORY_COLORS } from './category-config';
import { FileViewer } from './file-viewer';
import type { FileEntity } from '@/types/file';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function BookmarkCard({ file }: { file: FileEntity }) {
  const { toggle } = useBookmarks();
  const openViewer = useLibraryStore((s) => s.openViewer);
  const downloadMutation = useDownloadUrl();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div
      className='flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 p-3
                    transition-colors hover:border-white/15 hover:bg-white/6'
    >
      {/* File type dot */}
      <div
        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${isPdf ? 'bg-red-400' : 'bg-blue-400'}`}
      />

      {/* Name + meta */}
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-1 text-sm font-medium text-white leading-snug'>{file.name}</p>
        <div className='mt-1 flex items-center gap-2'>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium
                        ${CATEGORY_COLORS[file.category] ?? CATEGORY_COLORS.MISC}`}
          >
            {CATEGORY_LABELS[file.category] ?? file.category}
          </span>
          <span className='text-[10px] text-white/30'>{formatBytes(file.size)}</span>
        </div>
        {file.subject && (
          <p className='mt-0.5 truncate text-[10px] text-white/30'>{file.subject}</p>
        )}
      </div>

      {/* Actions */}
      <div className='flex shrink-0 items-center gap-0.5'>
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            className='rounded-lg p-1.5 text-yellow-400/60 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors'
            title='Remove bookmark'
          >
            <Bookmark className='h-3.5 w-3.5 fill-yellow-400/60' />
          </button>
        ) : (
          <div className='flex items-center gap-1'>
            <button
              onClick={() => {
                toggle(file);
                setConfirmRemove(false);
              }}
              className='rounded px-2 py-1 text-[10px] bg-yellow-500/80 text-white hover:bg-yellow-500'
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className='rounded px-2 py-1 text-[10px] bg-white/10 text-white/60 hover:bg-white/15'
            >
              Cancel
            </button>
          </div>
        )}
        <button
          onClick={() => downloadMutation.mutate(file.id)}
          disabled={downloadMutation.isPending}
          className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors'
          title='Download'
        >
          <Download className='h-3.5 w-3.5' />
        </button>
        <button
          onClick={() => openViewer(file)}
          className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors'
          title='View'
        >
          <Eye className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  );
}

export function BookmarksPanel() {
  const closePanel = useBookmarksStore((s) => s.closePanel);
  const { bookmarks } = useBookmarks();
  const viewerFile = useLibraryStore((s) => s.viewerFile);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? bookmarks.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          (f.subject ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : bookmarks;

  return (
    <>
      <div
        className='pointer-events-auto absolute bottom-20 right-4 z-20
                   flex w-80 flex-col gap-3 rounded-2xl border border-white/10
                   bg-black/75 p-4 shadow-2xl backdrop-blur-md'
        style={{ maxHeight: 'calc(100vh - 8rem)' }}
      >
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Bookmark className='h-4 w-4 fill-yellow-400 text-yellow-400' />
            <span className='text-sm font-semibold text-white'>Bookmarks</span>
            <span className='text-xs text-white/30'>({bookmarks.length})</span>
          </div>
          <button
            onClick={closePanel}
            className='rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Search */}
        {bookmarks.length > 0 && (
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25' />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search bookmarks…'
              className='w-full rounded-lg border border-white/10 bg-white/6 py-2 pl-9 pr-3
                         text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none'
            />
          </div>
        )}

        {/* List */}
        <div className='flex flex-col gap-2 overflow-y-auto'>
          {bookmarks.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-10 text-center'>
              <Bookmark className='h-10 w-10 text-white/10' />
              <p className='text-sm text-white/30'>No bookmarks yet</p>
              <p className='text-xs text-white/20'>
                Tap the bookmark icon on any file in the library.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className='py-6 text-center text-xs text-white/30'>No results for "{search}"</p>
          ) : (
            filtered.map((file) => <BookmarkCard key={file.id} file={file} />)
          )}
        </div>
      </div>

      {/* FileViewer portal — mounted here so it works outside the library zone panel */}
      {viewerFile && <FileViewer />}
    </>
  );
}
