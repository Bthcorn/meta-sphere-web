import { PencilIcon } from 'lucide-react';
import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function WhiteboardToggle({ open, onToggle }: Props) {
  const drawingUsers = useWhiteboardStore((s) => s.drawingUsers);
  const selfId = useAuthStore((s) => s.user?.id);

  const othersDrawing = Object.values(drawingUsers).filter(
    (u) => String(u.userId) !== String(selfId)
  );
  const anyoneDrawing = !open && othersDrawing.length > 0;

  const label =
    othersDrawing.length === 1
      ? `${othersDrawing[0].username} is drawing…`
      : `${othersDrawing.map((u) => u.username).join(', ')} drawing…`;

  return (
    <div className='pointer-events-auto absolute bottom-4 right-20 z-20 flex flex-col items-center gap-2'>
      {/* Floating label — only when panel is closed and someone is drawing */}
      {anyoneDrawing && (
        <div
          className='flex items-center gap-1.5 rounded-full border border-emerald-400/25
                     bg-black/75 px-2.5 py-1 text-[11px] font-medium text-emerald-300
                     backdrop-blur-md whitespace-nowrap shadow-lg'
        >
          <span className='flex gap-[3px]'>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className='block h-1 w-1 rounded-full bg-emerald-400 animate-bounce'
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
          {label}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`flex h-11 w-11 items-center justify-center rounded-full
                    border border-white/10 backdrop-blur-md transition-all
                    ${
                      open
                        ? 'bg-blue-600 text-white'
                        : 'bg-black/70 text-white/70 hover:bg-black/80 hover:text-white'
                    }`}
        title={open ? 'Close whiteboard' : 'Open whiteboard'}
      >
        <PencilIcon className='size-4' />
      </button>
    </div>
  );
}
