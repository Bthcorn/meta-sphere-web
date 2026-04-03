import { FileText, FileIcon, Download, Eye, X } from 'lucide-react';
import { useLibraryStore } from '@/store/library.store';
import { useDownloadUrl } from '@/hooks/useLibrary';
import { useAuthStore } from '@/store/auth.store';
import { useSessionStore } from '@/store/session.store';
import type { FileEntity } from '@/types/file';

interface Props {
  file: FileEntity;
  onRemove: (fileId: string) => void;
  isNew?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function TrayFileCard({ file, onRemove, isNew }: Props) {
  const openViewer = useLibraryStore((s) => s.openViewer);
  const downloadMutation = useDownloadUrl();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const activeSession = useSessionStore((s) => s.activeSession);
  const isHost = activeSession?.hostId === String(currentUserId);
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div
      className='relative flex items-center gap-3 rounded-xl border border-white/8
                    bg-white/4 px-3 py-2.5 transition-colors hover:border-white/15'
    >
      {/* New badge */}
      {isNew && (
        <span
          className='absolute -top-1.5 -right-1 rounded-full bg-blue-500 px-1.5
                         py-0.5 text-[9px] font-bold text-white'
        >
          NEW
        </span>
      )}

      {/* File type icon */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                       ${isPdf ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
      >
        {isPdf ? (
          <FileText className='h-3.5 w-3.5 text-red-400' />
        ) : (
          <FileIcon className='h-3.5 w-3.5 text-blue-400' />
        )}
      </div>

      {/* File info */}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-xs font-medium text-white'>{file.name}</p>
        <p className='text-[10px] text-white/30'>
          {formatBytes(file.size)} · by {file.uploadedBy.username}
        </p>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-0.5'>
        <button
          onClick={() => openViewer(file)}
          className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors'
          title='View'
        >
          <Eye className='h-3.5 w-3.5' />
        </button>
        <button
          onClick={() => downloadMutation.mutate(file.id)}
          disabled={downloadMutation.isPending}
          className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors'
          title='Download'
        >
          <Download className='h-3.5 w-3.5' />
        </button>
        {isHost && (
          <button
            onClick={() => onRemove(file.id)}
            className='rounded-lg p-1.5 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors'
            title='Remove from tray'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
    </div>
  );
}
