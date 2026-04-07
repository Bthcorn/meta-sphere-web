import { useState } from 'react';
import { Users, ChevronRight, ChevronLeft, Check, Lock, UserPlus } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useOnlineFriends } from '@/hooks/useOnlineFriends';
import { useAuthStore } from '@/store/auth.store';
import { useSessionStore } from '@/store/session.store';
import { colorFromUsername } from '@/lib/avatar-utils';
import type { Session } from '@/types/session';

// ── Sub-components ────────────────────────────────────────────────────────

function FriendAvatar({ username }: { username: string }) {
  const color = colorFromUsername(username);
  return (
    <div
      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'
      style={{ backgroundColor: color }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function MeetingPanel() {
  const { sessionList, joinSession, createAndJoin, isLoading } = useSession();
  const { onlineFriends, isLoading: friendsLoading } = useOnlineFriends();
  const userId = String(useAuthStore((s) => s.user?.id ?? ''));
  const config = useSessionStore((s) => s.currentZoneConfig)!;

  // ── Join flow ────────────────────────────────────────────────────────────
  const [joinTarget, setJoinTarget] = useState<Session | null>(null);
  const [joinPassword, setJoinPassword] = useState('');

  // ── Create flow (2-step) ─────────────────────────────────────────────────
  type CreateStep = 'idle' | 'details' | 'invite';
  const [createStep, setCreateStep] = useState<CreateStep>('idle');
  const [newTitle, setNewTitle] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());

  const isPending = joinSession.isPending || createAndJoin.isPending;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function resetCreate() {
    setCreateStep('idle');
    setNewTitle('');
    setNewPassword('');
    setSelectedFriendIds(new Set());
  }

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDetailsNext() {
    if (!newTitle.trim()) return;
    setCreateStep('invite');
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    createAndJoin.mutate({
      title: newTitle.trim(),
      password: newPassword.trim() || undefined,
      invitedFriendsIds: selectedFriendIds.size > 0 ? [...selectedFriendIds] : undefined,
    });
    resetCreate();
  }

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

  // ── Render ────────────────────────────────────────────────────────────────
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
        <p className='text-xs text-white/30'>Loading sessions…</p>
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
                    <span className='truncate text-sm font-medium text-white/90'>{s.title}</span>
                    {s.hasPassword && <Lock className='h-3 w-3 shrink-0 text-white/30' />}
                    {isHost && (
                      <span className='shrink-0 rounded bg-violet-600/30 px-1 py-0.5 text-[10px] text-violet-300'>
                        host
                      </span>
                    )}
                  </div>
                  <p className='mt-0.5 text-xs text-white/30'>
                    {count} participant{count !== 1 ? 's' : ''}
                  </p>
                </div>

                {!isHost && (
                  <button
                    onClick={() => handleJoin(s)}
                    disabled={isPending}
                    className='ml-2 shrink-0 rounded-lg bg-violet-600/80 px-3 py-1 text-xs
                               font-medium text-white transition hover:bg-violet-500 disabled:opacity-40'
                  >
                    Join
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Join password prompt ─────────────────────────────────────── */}
      {joinTarget && (
        <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3'>
          <p className='text-xs text-white/50'>
            Password required for <span className='text-white/80'>{joinTarget.title}</span>
          </p>
          <input
            autoFocus
            type='password'
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmJoin()}
            placeholder='Enter password'
            className='rounded-lg bg-white/10 px-3 py-2 text-sm text-white
                       placeholder-white/30 outline-none ring-1 ring-white/10
                       focus:ring-white/30'
          />
          <div className='flex gap-2'>
            <button
              onClick={handleConfirmJoin}
              disabled={!joinPassword.trim() || isPending}
              className='flex-1 rounded-lg bg-violet-600 py-2 text-sm font-medium
                         text-white hover:bg-violet-500 disabled:opacity-40'
            >
              {isPending ? 'Joining…' : 'Join'}
            </button>
            <button
              onClick={() => {
                setJoinTarget(null);
                setJoinPassword('');
              }}
              className='rounded-lg border border-white/10 px-3 text-xs text-white/50 hover:bg-white/5'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Create flow ──────────────────────────────────────────────── */}
      {createStep === 'idle' && !joinTarget && (
        <button
          onClick={() => setCreateStep('details')}
          className='w-full rounded-lg border border-white/10 py-2 text-sm
                     text-white/50 transition hover:bg-white/5 hover:text-white/80'
        >
          + New session
        </button>
      )}

      {/* Step 1 — Session details */}
      {createStep === 'details' && (
        <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3'>
          <p className='text-xs font-semibold text-white/50'>New session</p>

          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDetailsNext()}
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
              onClick={handleDetailsNext}
              disabled={!newTitle.trim()}
              className='flex flex-1 items-center justify-center gap-1.5 rounded-lg
                         bg-violet-600 py-2 text-sm font-medium text-white
                         hover:bg-violet-500 disabled:opacity-40'
            >
              Invite friends
              <ChevronRight className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={resetCreate}
              className='rounded-lg border border-white/10 px-3 text-xs
                         text-white/50 hover:bg-white/5'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Invite friends */}
      {createStep === 'invite' && (
        <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3'>
          {/* Header row */}
          <div className='flex items-center gap-2'>
            <Users className='h-3.5 w-3.5 text-violet-400' />
            <p className='text-xs font-semibold text-white/70'>Invite online friends</p>
            {selectedFriendIds.size > 0 && (
              <span className='ml-auto rounded-full bg-violet-600/30 px-2 py-0.5 text-[10px] text-violet-300'>
                {selectedFriendIds.size} selected
              </span>
            )}
          </div>

          {/* Friends list */}
          {friendsLoading ? (
            <p className='py-2 text-center text-xs text-white/30'>Loading…</p>
          ) : onlineFriends.length === 0 ? (
            <div className='flex flex-col items-center gap-1 py-3'>
              <UserPlus className='h-5 w-5 text-white/20' />
              <p className='text-xs text-white/30'>No friends online right now</p>
            </div>
          ) : (
            <div className='flex max-h-44 flex-col gap-1 overflow-y-auto pr-0.5'>
              {onlineFriends.map((f) => {
                const selected = selectedFriendIds.has(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFriend(f.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left
                                transition ${selected ? 'bg-violet-600/20 ring-1 ring-violet-500/40' : 'hover:bg-white/5'}`}
                  >
                    <FriendAvatar username={f.username} />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm text-white/90'>{f.username}</p>
                      {(f.firstName || f.lastName) && (
                        <p className='truncate text-xs text-white/40'>
                          {[f.firstName, f.lastName].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                    {selected && <Check className='h-3.5 w-3.5 shrink-0 text-violet-400' />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className='flex gap-2 pt-1'>
            <button
              onClick={() => setCreateStep('details')}
              className='flex items-center gap-1 rounded-lg border border-white/10 px-2.5
                         py-2 text-xs text-white/50 transition hover:bg-white/5'
            >
              <ChevronLeft className='h-3.5 w-3.5' />
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={isPending}
              className='flex flex-1 items-center justify-center gap-1.5 rounded-lg
                         bg-green-600 py-2 text-sm font-medium text-white
                         hover:bg-green-500 disabled:opacity-40'
            >
              {isPending
                ? 'Creating…'
                : selectedFriendIds.size > 0
                  ? `Create & invite ${selectedFriendIds.size}`
                  : 'Create & join'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
