import { useState, useCallback, useEffect } from 'react';
import { Minimize2Icon } from 'lucide-react';
import { WhiteboardCanvas } from './whiteboard-canvas';
import { WhiteboardToolbar } from './whiteboard-toolbar';
import { RemoteCursors } from './remote-cursors';
import { DrawingIndicator } from './drawing-indicator';
import { useWhiteboard } from '@/hooks/useWhiteboard';
import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  onClose: () => void;
}

export function WhiteboardPanel({ onClose }: Props) {
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#ffffff');
  const [width, setWidth] = useState(4);

  const activeSession = useSessionStore((s) => s.activeSession);
  const userId = useAuthStore((s) => s.user?.id);
  const localStack = useWhiteboardStore((s) => s.localStack);

  const sessionId = activeSession?.id ?? '';
  const isHost = activeSession?.hostId === userId;

  const { emitStroke, emitCursor, emitDrawing, emitLiveStroke, emitUndo, emitClear } =
    useWhiteboard(sessionId);

  // ── Keyboard shortcut: Ctrl+Z ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        emitUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [emitUndo]);

  // ── PNG export ────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    // Merge grid + draw layers onto a temp canvas
    const grid = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
    const draw = document.querySelectorAll('canvas')[1] as HTMLCanvasElement;
    if (!draw) return;

    const temp = document.createElement('canvas');
    temp.width = draw.width;
    temp.height = draw.height;
    const ctx = temp.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, temp.width, temp.height);
    if (grid) ctx.drawImage(grid, 0, 0);
    ctx.drawImage(draw, 0, 0);

    const link = document.createElement('a');
    link.download = `whiteboard-${sessionId.slice(0, 8)}.png`;
    link.href = temp.toDataURL('image/png');
    link.click();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className='flex items-center justify-center h-full text-white/40 text-sm'>
        Join a session to use the whiteboard.
      </div>
    );
  }

  return (
    <div
      className='pointer-events-auto absolute inset-4 z-30 flex flex-col
                  rounded-2xl border border-white/10 bg-black/80
                  shadow-2xl backdrop-blur-md overflow-hidden'
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0'>
        <span className='text-sm font-medium text-white'>Whiteboard</span>
        <div className='flex items-center gap-2'>
          {isHost && (
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium'>
              Host
            </span>
          )}
          <button onClick={onClose} className='text-white/40 hover:text-white transition-colors'>
            <Minimize2Icon className='size-4' />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className='flex justify-center py-2 shrink-0'>
        <WhiteboardToolbar
          tool={tool}
          color={color}
          width={width}
          isHost={isHost}
          canUndo={localStack.length > 0}
          onToolChange={setTool}
          onColorChange={setColor}
          onWidthChange={setWidth}
          onUndo={emitUndo}
          onClear={emitClear}
          onExport={handleExport}
        />
      </div>

      {/* Canvas area */}
      <div className='relative flex-1 overflow-hidden bg-[#1a1a2e]'>
        <WhiteboardCanvas
          tool={tool}
          color={color}
          width={width}
          emitStroke={emitStroke}
          emitCursor={emitCursor}
          emitDrawing={emitDrawing}
          emitLiveStroke={emitLiveStroke}
        />
        <RemoteCursors />
        <DrawingIndicator />
      </div>
    </div>
  );
}
