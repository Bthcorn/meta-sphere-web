import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLibraryStore } from '@/store/library.store';
import { filesApi } from '@/api/files.api';
import { X, Download, Loader2, AlertCircle } from 'lucide-react';

type ViewerState =
  | { status: 'loading' }
  | { status: 'pdf'; url: string }
  | { status: 'docx'; html: string }
  | { status: 'error'; message: string };

export function FileViewer() {
  const { viewerFile, closeViewer } = useLibraryStore();
  const [state, setState] = useState<ViewerState>({ status: 'loading' });

  useEffect(() => {
    if (!viewerFile) return;
    setState({ status: 'loading' });

    filesApi
      .getDownloadUrl(viewerFile.id)
      .then(async ({ url }) => {
        if (viewerFile.mimeType === 'application/pdf') {
          setState({ status: 'pdf', url });
          return;
        }

        // DOCX — fetch bytes and convert with mammoth
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const mammoth = await import('mammoth');
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setState({ status: 'docx', html });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load file';
        setState({ status: 'error', message: msg });
      });
  }, [viewerFile]);

  if (!viewerFile) return null;

  const handleDownload = () => {
    filesApi.getDownloadUrl(viewerFile.id).then(({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'>
      <div
        className='relative flex w-[90vw] max-w-4xl flex-col rounded-2xl border border-white/10 bg-gray-900 shadow-2xl'
        style={{ height: '85vh' }}
      >
        {/* Header */}
        <div className='flex items-center gap-3 border-b border-white/10 px-5 py-3'>
          <div className='flex-1 min-w-0'>
            <p className='truncate text-sm font-medium text-white'>{viewerFile.name}</p>
            {viewerFile.subject && <p className='text-xs text-white/40'>{viewerFile.subject}</p>}
          </div>
          <button
            onClick={handleDownload}
            className='flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors'
          >
            <Download className='h-3.5 w-3.5' />
            Download
          </button>
          <button
            onClick={closeViewer}
            className='rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          {state.status === 'loading' && (
            <div className='flex h-full items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-white/30' />
            </div>
          )}

          {state.status === 'error' && (
            <div className='flex h-full flex-col items-center justify-center gap-3 text-white/50'>
              <AlertCircle className='h-10 w-10' />
              <p className='text-sm'>{state.message}</p>
              <button
                onClick={handleDownload}
                className='text-xs text-blue-400 underline hover:text-blue-300'
              >
                Try downloading instead
              </button>
            </div>
          )}

          {state.status === 'pdf' && (
            <iframe
              src={state.url}
              className='h-full w-full rounded-b-2xl border-0 bg-white'
              title={viewerFile.name}
            />
          )}

          {state.status === 'docx' && (
            <div className='h-full overflow-y-auto p-6'>
              <p className='mb-4 text-xs text-white/30'>
                Formatted preview — formatting may differ from the original
              </p>
              <div
                className='text-sm text-white/80 leading-relaxed [&_h1]:text-lg [&_h1]:font-bold
                           [&_h2]:font-semibold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5'
                dangerouslySetInnerHTML={{ __html: state.html }}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
