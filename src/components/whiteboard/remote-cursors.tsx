import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';

// Stable color per userId so each collaborator gets a consistent color
const CURSOR_COLORS = ['#34d399', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#facc15'];

function cursorColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function RemoteCursors() {
  const cursors = useWhiteboardStore((s) => s.remoteCursors);
  const selfId = useAuthStore((s) => s.user?.id);

  return (
    <div className='pointer-events-none absolute inset-0' style={{ zIndex: 20 }}>
      {Object.values(cursors)
        .filter((c) => String(c.userId) !== String(selfId))
        .map((c) => {
          const clr = cursorColor(c.userId);
          // Points are in canvas coordinate space (1200×800).
          // Convert to percentage for CSS positioning.
          const xPct = (c.x / 1200) * 100;
          const yPct = (c.y / 800) * 100;
          return (
            <div
              key={c.userId}
              className='absolute flex items-center gap-1'
              style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-2px, -2px)' }}
            >
              {/* Cursor dot */}
              <div className='w-2.5 h-2.5 rounded-full shadow' style={{ backgroundColor: clr }} />
              {/* Name label */}
              <span
                className='rounded px-1 py-0.5 text-[10px] font-medium text-black'
                style={{ backgroundColor: clr }}
              >
                {c.username}
              </span>
            </div>
          );
        })}
    </div>
  );
}
