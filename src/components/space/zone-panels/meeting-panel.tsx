import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/store/auth.store';
import { useSessionStore } from '@/store/session.store';
import type { Session } from '@/types/session';

export function MeetingPanel() {
  const { sessionList, joinSession, createAndJoin, isLoading } = useSession();
  const userId = String(useAuthStore((s) => s.user?.id ?? ''));
  const config = useSessionStore((s) => s.currentZoneConfig)!;

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [joinTarget, setJoinTarget] = useState<Session | null>(null);
  const [joinPassword, setJoinPassword] = useState('');

  const isPending = joinSession.isPending || createAndJoin.isPending;

  function handleJoin(session: Session) {
    if (session.hasPassword) {
      setJoinTarget(session);
    } else {
      joinSession.mutate({ sessionId: session.id });
    }
  }

  function handleConfirmJoin() {
    if (!joinTarget) return;
    joinSession.mutate({ sessionId: joinTarget.id, password: joinPassword });
    setJoinTarget(null);
    setJoinPassword('');
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    createAndJoin.mutate({
      title: newTitle.trim(),
      password: newPassword.trim() || undefined,
    });
    setShowCreate(false);
    setNewTitle('');
    setNewPassword('');
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* Header */}
      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-white/40'>
          {config.label}
        </p>
        <p className='mt-0.5 text-sm text-white/60'>Meeting sessions</p>
      </div>

      {/* Session list */}
      {isLoading ? (
        <p className='text-xs text-white/30'>Loading sessions...</p>
      ) : sessionList.length === 0 ? (
        <p className='text-xs text-white/30'>No sessions yet — create one below.</p>
      ) : (
        <div className='flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1'>
          {sessionList.map((s) => {
            const isHost = s.hostId === userId;
            const count = s._count?.sessionParticipants ?? 0;
            return (
              <div
                key={s.id}
                className='flex items-center justify-between rounded-lg bg-white/5 px-3 py-2'
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        s.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    />
                    <p className='truncate text-sm font-medium text-white'>{s.title}</p>
                    {s.hasPassword && <span className='text-[10px] text-white/40'>🔒</span>}
                    {isHost && (
                      <span className='shrink-0 rounded bg-purple-600/40 px-1.5 py-0.5 text-[10px] text-purple-300'>
                        host
                      </span>
                    )}
                  </div>
                  <p className='mt-0.5 text-xs text-white/40'>
                    {count} {count === 1 ? 'person' : 'people'} · {s.status.toLowerCase()}
                  </p>
                </div>
                {s.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleJoin(s)}
                    disabled={isPending}
                    className='ml-3 shrink-0 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium
                               text-white transition hover:bg-blue-500 disabled:opacity-40'
                  >
                    Join
                  </button>
                ) : (
                  <span
                    className='ml-3 shrink-0 rounded-md border border-white/10 px-3 py-1
                                   text-xs text-white/30 cursor-not-allowed'
                  >
                    Not started
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Password prompt for locked sessions */}
      {joinTarget && (
        <div className='flex gap-2'>
          <input
            autoFocus
            type='password'
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmJoin()}
            placeholder={`Password for "${joinTarget.title}"`}
            className='flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white
                       placeholder-white/30 outline-none ring-1 ring-white/10
                       focus:ring-white/30'
          />
          <button
            onClick={handleConfirmJoin}
            disabled={isPending}
            className='rounded-lg bg-blue-600 px-3 text-sm font-medium text-white
                       hover:bg-blue-500 disabled:opacity-40'
          >
            Join
          </button>
          <button
            onClick={() => {
              setJoinTarget(null);
              setJoinPassword('');
            }}
            className='rounded-lg border border-white/10 px-3 text-xs
                       text-white/50 hover:bg-white/5'
          >
            ✕
          </button>
        </div>
      )}

      {/* Create session */}
      {showCreate ? (
        <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3'>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder='Session name'
            className='rounded-lg bg-white/10 px-3 py-2 text-sm text-white
                       placeholder-white/30 outline-none ring-1 ring-white/10
                       focus:ring-white/30'
          />
          <input
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='Password (optional)'
            className='rounded-lg bg-white/10 px-3 py-2 text-sm text-white
                       placeholder-white/30 outline-none ring-1 ring-white/10
                       focus:ring-white/30'
          />
          <div className='flex gap-2'>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || isPending}
              className='flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium
                         text-white hover:bg-green-500 disabled:opacity-40'
            >
              {isPending ? 'Creating...' : 'Create & join'}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewTitle('');
                setNewPassword('');
              }}
              className='rounded-lg border border-white/10 px-3 text-xs
                         text-white/50 hover:bg-white/5'
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className='w-full rounded-lg border border-white/10 py-2 text-sm
                     text-white/50 transition hover:bg-white/5 hover:text-white/80'
        >
          + New session
        </button>
      )}
    </div>
  );
}
