import { useRef, useState } from 'react';
import { Paperclip, Upload, X, Loader2 } from 'lucide-react';
import { useSessionFilesStore } from '@/store/session-files.store';
import { useSessionFiles } from '@/hooks/useSessionFiles';
import { useLibraryStore } from '@/store/library.store';
import { TrayFileCard } from './tray-file-card';
import { FileViewer } from '@/components/library/file-viewer';

const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface Props {
  sessionId: string;
}

export function FileTray({ sessionId }: Props) {
  const { trayOpen, toggleTray, openTray, markSeen, unreadBySession, uploadProgress } =
    useSessionFilesStore();
  const { files, uploadFile, removeFile, isUploading } = useSessionFiles(sessionId);
  const viewerFile = useLibraryStore((s) => s.viewerFile);

  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasUnread = !!unreadBySession[sessionId];
  const [seenIds] = useState<Set<string>>(() => new Set());

  const handleToggle = () => {
    if (!trayOpen) {
      markSeen(sessionId);
      files.forEach((f) => seenIds.add(f.id));
    }
    toggleTray();
  };

  const validateAndUpload = (file: File) => {
    setFileError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF and DOCX files are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError('File must be under 15 MB');
      return;
    }
    openTray();
    uploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };

  return (
    <>
      {/* Toggle button — sits to the left of WhiteboardToggle (right-20), same row */}
      <div className='pointer-events-auto absolute bottom-4 right-36 z-20'>
        <button
          onClick={handleToggle}
          className={`relative flex items-center gap-2 rounded-full
                      border px-4 py-2 text-white shadow-lg backdrop-blur-md transition-colors
                      ${
                        trayOpen
                          ? 'border-blue-500/50 bg-blue-600/30'
                          : 'border-white/10 bg-black/70 hover:bg-black/80'
                      }`}
          title='File Tray'
        >
          <Paperclip className='h-4 w-4' />
          <span className='text-xs font-medium'>Files</span>
          {files.length > 0 && <span className='text-xs text-white/50'>{files.length}</span>}
          {hasUnread && !trayOpen && (
            <span
              className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
                             rounded-full bg-blue-500 text-[9px] font-bold text-white'
            >
              !
            </span>
          )}
        </button>
      </div>

      {/* Tray panel — opens upward, aligned with the button */}
      {trayOpen && (
        <div
          className='pointer-events-auto absolute bottom-16 right-36 z-20 flex w-80
                     flex-col gap-3 rounded-2xl border border-white/10 bg-black/80
                     p-4 shadow-2xl backdrop-blur-md'
          style={{ maxHeight: '60vh' }}
        >
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Paperclip className='h-4 w-4 text-white/60' />
              <span className='text-sm font-semibold text-white'>Shared Files</span>
            </div>
            <button
              onClick={handleToggle}
              className='rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          {/* Upload progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className='h-1 w-full overflow-hidden rounded-full bg-white/10'>
              <div
                className='h-full rounded-full bg-blue-500 transition-all'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl
                        border-2 border-dashed py-4 transition-colors
                        ${
                          isUploading
                            ? 'cursor-not-allowed border-white/10 opacity-50'
                            : dragging
                              ? 'border-blue-400 bg-blue-500/10'
                              : 'border-white/15 bg-white/4 hover:border-white/25 hover:bg-white/6'
                        }`}
          >
            {isUploading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin text-white/40' />
                <span className='text-xs text-white/40'>Uploading…</span>
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 text-white/30' />
                <span className='text-xs text-white/50'>Drop PDF or DOCX to share</span>
              </>
            )}
            <input
              ref={inputRef}
              type='file'
              accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          {fileError && <p className='text-xs text-red-400'>{fileError}</p>}

          {/* File list */}
          <div className='flex-1 overflow-y-auto'>
            {files.length === 0 ? (
              <p className='py-4 text-center text-xs text-white/30'>No files shared yet</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {files.map((file) => (
                  <TrayFileCard
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                    isNew={!seenIds.has(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viewer popup (shared with library) */}
      {viewerFile && <FileViewer />}
    </>
  );
}
