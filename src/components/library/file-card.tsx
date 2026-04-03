import { useState } from 'react';
import { FileText, FileIcon, Download, Eye, Trash2, Tag, User, BookOpen } from 'lucide-react';
import { useLibraryStore } from '@/store/library.store';
import { useDeleteLibraryFile, useDownloadUrl } from '@/hooks/useLibrary';
import { useAuthStore } from '@/store/auth.store';
import type { FileEntity } from '@/types/file';

const CATEGORY_LABELS: Record<string, string> = {
  LECTURE_NOTES: 'Lecture',
  PAST_EXAMS: 'Past Exam',
  ASSIGNMENTS: 'Assignment',
  SOLUTIONS: 'Solution',
  CHEAT_SHEETS: 'Cheat Sheet',
  TUTORIAL: 'Tutorial',
  RESOURCE: 'Resource',
  MISC: 'Misc',
};

const CATEGORY_COLORS: Record<string, string> = {
  LECTURE_NOTES: 'bg-blue-500/20 text-blue-300',
  PAST_EXAMS: 'bg-red-500/20 text-red-300',
  ASSIGNMENTS: 'bg-orange-500/20 text-orange-300',
  SOLUTIONS: 'bg-green-500/20 text-green-300',
  CHEAT_SHEETS: 'bg-purple-500/20 text-purple-300',
  TUTORIAL: 'bg-teal-500/20 text-teal-300',
  RESOURCE: 'bg-indigo-500/20 text-indigo-300',
  MISC: 'bg-gray-500/20 text-gray-300',
};

interface Props {
  file: FileEntity;
  roomId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function FileCard({ file, roomId }: Props) {
  const openViewer = useLibraryStore((s) => s.openViewer);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const deleteMutation = useDeleteLibraryFile(roomId);
  const downloadMutation = useDownloadUrl();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPdf = file.mimeType === 'application/pdf';
  const isOwner = String(currentUserId) === file.uploadedById;
  const visibleTags = file.tags.slice(0, 2);
  const extraTagCount = file.tags.length - 2;

  return (
    <div className='group relative flex flex-col gap-2 rounded-xl border border-white/8 bg-white/4 p-3 transition-colors hover:border-white/15 hover:bg-white/6'>
      {/* Top row: icon + name + category badge */}
      <div className='flex items-start gap-3'>
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                         ${isPdf ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
        >
          {isPdf ? (
            <FileText className='h-4 w-4 text-red-400' />
          ) : (
            <FileIcon className='h-4 w-4 text-blue-400' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='line-clamp-2 text-sm font-medium text-white leading-snug'>{file.name}</p>
          <p className='mt-0.5 text-xs text-white/30'>{formatBytes(file.size)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium
                          ${CATEGORY_COLORS[file.category] ?? CATEGORY_COLORS.MISC}`}
        >
          {CATEGORY_LABELS[file.category] ?? file.category}
        </span>
      </div>

      {/* Subject + year level */}
      {(file.subject || file.yearLevel) && (
        <div className='flex items-center gap-2 text-xs text-white/40'>
          {file.subject && (
            <span className='flex items-center gap-1 min-w-0'>
              <BookOpen className='h-3 w-3 shrink-0' />
              <span className='truncate'>{file.subject}</span>
            </span>
          )}
          {file.yearLevel && (
            <span className='shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-white/50'>
              Year {file.yearLevel}
            </span>
          )}
        </div>
      )}

      {/* Tags + uploader */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-wrap gap-1'>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className='flex items-center gap-0.5 rounded px-1.5 py-0.5
                                       bg-white/8 text-[10px] text-white/40'
            >
              <Tag className='h-2.5 w-2.5' />
              {tag}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className='rounded px-1.5 py-0.5 bg-white/8 text-[10px] text-white/30'>
              +{extraTagCount}
            </span>
          )}
        </div>
        <span className='flex items-center gap-1 shrink-0 text-[10px] text-white/30'>
          <User className='h-2.5 w-2.5' />
          {file.uploadedBy.username} · {formatRelativeTime(file.createdAt)}
        </span>
      </div>

      {/* Footer: download count + actions */}
      <div className='flex items-center justify-between border-t border-white/6 pt-2'>
        <span className='flex items-center gap-1 text-[10px] text-white/30'>
          <Download className='h-3 w-3' />
          {file.downloadCount} downloads
        </span>
        <div className='flex items-center gap-1'>
          {isOwner && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className='rounded-lg p-1.5 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors'
              title='Delete'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
          {confirmDelete && (
            <div className='flex items-center gap-1'>
              <button
                onClick={() => deleteMutation.mutate(file.id)}
                className='rounded px-2 py-1 text-[10px] bg-red-500/80 text-white hover:bg-red-500'
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className='rounded px-2 py-1 text-[10px] bg-white/10 text-white/60 hover:bg-white/15'
              >
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={() => downloadMutation.mutate(file.id)}
            disabled={downloadMutation.isPending}
            className='rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors'
            title='Download'
          >
            <Download className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={() => openViewer(file)}
            className='rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors'
            title='View'
          >
            <Eye className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}
