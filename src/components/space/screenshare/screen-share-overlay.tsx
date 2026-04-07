import { useRef, useEffect, useState } from 'react';
import { Minimize2, Maximize2, MonitorOff, GripHorizontal } from 'lucide-react';
import { useScreenShareStore } from '@/store/screen-share.store';

interface Props {
  onStop: () => void;
}

export function ScreenShareOverlay({ onStop }: Props) {
  const { stream, sharerName, isLocal, isMinimized, setMinimized, clearStream } =
    useScreenShareStore();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream, isMinimized]);

  const [pos, setPos] = useState({ x: 24, y: 80 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (!stream) return null;

  // ── MINIMIZED: floating PiP bubble ────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        className='pointer-events-auto fixed z-50 flex flex-col overflow-hidden
                   rounded-xl border border-white/20 shadow-2xl bg-black select-none'
        style={{ left: pos.x, top: pos.y, width: 240, cursor: 'grab' }}
        onMouseDown={onMouseDown}
      >
        <div className='flex items-center justify-between px-2 py-1 bg-black/80 border-b border-white/10'>
          <div className='flex items-center gap-1.5 text-[10px] text-white/50'>
            <GripHorizontal size={11} />
            <span className='truncate max-w-[130px]'>{sharerName}</span>
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setMinimized(false)}
            className='rounded p-0.5 hover:bg-white/10 text-white/40 hover:text-white transition-colors'
            title='Expand'
          >
            <Maximize2 size={12} />
          </button>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className='w-full aspect-video object-contain bg-black'
        />
      </div>
    );
  }

  // ── EXPANDED: centered floating window ───────────────────────────────
  return (
    <div className='pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='flex flex-col overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black w-full max-w-5xl'>
        <div className='flex items-center justify-between px-3 py-2 bg-black/80 border-b border-white/10 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-blue-400 animate-pulse' />
            <span className='text-xs text-white/80'>
              <span className='font-semibold text-white'>{sharerName}</span>
              {isLocal ? ' · You are sharing' : ' is sharing their screen'}
            </span>
          </div>

          <div className='flex items-center gap-1.5'>
            <button
              onClick={() => setMinimized(true)}
              className='flex items-center gap-1 rounded-md px-2 py-1 text-xs
                         bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors'
            >
              <Minimize2 size={11} />
              Minimize
            </button>

            {isLocal && (
              <button
                onClick={() => {
                  onStop();
                  clearStream();
                }}
                className='flex items-center gap-1 rounded-md px-2 py-1 text-xs
                           bg-red-500/20 text-red-400 border border-red-500/30
                           hover:bg-red-500/30 transition-colors'
              >
                <MonitorOff size={11} />
                Stop
              </button>
            )}
          </div>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className='w-full aspect-video object-contain bg-black'
        />
      </div>
    </div>
  );
}
