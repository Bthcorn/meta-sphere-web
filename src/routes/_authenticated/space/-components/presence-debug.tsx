import { useAuthStore } from '@/store/auth.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useSessionStore } from '@/store/session.store';
import { decodeJwtSub } from '@/lib/jwt';

export function PresenceDebug() {
  const users = useSpacePresenceStore((s) => s.users);
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user?.id);
  const activeSession = useSessionStore((s) => s.activeSession);

  const list = Object.values(users);
  const selfId = decodeJwtSub(token) ?? (me != null ? String(me) : '');
  const self = list.find((u) => String(u.userId) === selfId);

  const socketRoom = self?.roomId ?? null;
  const sessionId = activeSession?.id ?? null;
  const roomMatch = sessionId ? socketRoom === sessionId : socketRoom === 'common_area';

  return (
    <div className='pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs font-mono text-[11px] text-white/55'>
      <div>Presence: {list.length} in snapshot</div>
      <div>Your id: {selfId || '—'}</div>
      <div>
        Socket room:{' '}
        <span className={roomMatch ? 'text-green-400' : 'text-red-400'}>{socketRoom ?? '—'}</span>
      </div>
      <div>Active session: {sessionId ?? 'none'}</div>
      <div>
        Room match:{' '}
        <span className={roomMatch ? 'text-green-400' : 'text-red-400'}>
          {roomMatch ? '✓ correct' : '✗ MISMATCH — switchUserRoom not working'}
        </span>
      </div>
      <div className='mt-1'>Others in snapshot:</div>
      {list
        .filter((u) => String(u.userId) !== selfId)
        .map((u) => (
          <div key={u.userId} className='ml-2'>
            {u.username} — room: {u.roomId}
          </div>
        ))}
    </div>
  );
}
