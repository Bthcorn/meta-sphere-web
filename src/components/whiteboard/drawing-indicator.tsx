import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';

export function DrawingIndicator() {
  const drawingUsers = useWhiteboardStore((s) => s.drawingUsers);
  const selfId = useAuthStore((s) => s.user?.id);

  const others = Object.values(drawingUsers).filter((u) => String(u.userId) !== String(selfId));

  if (others.length === 0) return null;

  const label =
    others.length === 1
      ? `${others[0].username} is drawing…`
      : `${others.map((u) => u.username).join(', ')} are drawing…`;

  return (
    <div
      className='pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1
                    text-[11px] text-white/70 backdrop-blur-sm'
    >
      {/* Animated dots */}
      <span className='flex gap-0.5'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='block h-1 w-1 rounded-full bg-white/60 animate-bounce'
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      {label}
    </div>
  );
}
