import { useState } from 'react';
import { X, UserCheck, UserPlus, Circle } from 'lucide-react';
import { useAllFriends } from '@/hooks/useAllFriends';
import { useOnlineFriends } from '@/hooks/useOnlineFriends';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { colorFromUsername } from '@/lib/avatar-utils';
import type { PendingFriendRequest } from '@/types/friend';

// ── Shared sub-components ─────────────────────────────────────────────────

function Avatar({ username, size = 'md' }: { username: string; size?: 'sm' | 'md' }) {
  const color = colorFromUsername(username);
  const cls = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm';
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: color }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ── Friends tab ───────────────────────────────────────────────────────────

function FriendsTab() {
  const { friends, isLoading } = useAllFriends();
  const { onlineFriends } = useOnlineFriends();

  const onlineIds = new Set(onlineFriends.map((f) => f.id));

  if (isLoading) {
    return <p className='py-8 text-center text-xs text-white/30'>Loading…</p>;
  }

  if (friends.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-10'>
        <UserCheck className='h-8 w-8 text-white/15' />
        <p className='text-xs text-white/30'>No friends yet.</p>
        <p className='text-xs text-white/20'>Point at someone in the space to send a request!</p>
      </div>
    );
  }

  // Sort: online first, then alphabetical
  const sorted = [...friends].sort((a, b) => {
    const aOnline = onlineIds.has(a.id) ? 0 : 1;
    const bOnline = onlineIds.has(b.id) ? 0 : 1;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return a.username.localeCompare(b.username);
  });

  const onlineCount = sorted.filter((f) => onlineIds.has(f.id)).length;

  return (
    <div className='flex flex-col gap-1 px-2'>
      {onlineCount > 0 && (
        <p className='px-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30'>
          Online — {onlineCount}
        </p>
      )}

      {sorted.map((friend) => {
        const isOnline = onlineIds.has(friend.id);
        const displayName =
          friend.firstName || friend.lastName
            ? [friend.firstName, friend.lastName].filter(Boolean).join(' ')
            : null;

        return (
          <div
            key={friend.id}
            className='flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5'
          >
            {/* Avatar with online dot */}
            <div className='relative shrink-0'>
              <Avatar username={friend.username} />
              <Circle
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full
                            ${isOnline ? 'fill-emerald-400 text-emerald-400' : 'fill-white/20 text-white/20'}`}
              />
            </div>

            {/* Info */}
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-white/90'>{friend.username}</p>
              {displayName && <p className='truncate text-xs text-white/40'>{displayName}</p>}
            </div>

            {/* Status pill */}
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium
                          ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/25'}`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Requests tab ──────────────────────────────────────────────────────────

function RequestsTab() {
  const { pendingRequests, isLoading, accept, decline } = useFriendRequests();

  if (isLoading) {
    return <p className='py-8 text-center text-xs text-white/30'>Loading…</p>;
  }

  if (pendingRequests.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-10'>
        <UserPlus className='h-8 w-8 text-white/15' />
        <p className='text-xs text-white/30'>No pending requests.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2 px-2'>
      {pendingRequests.map((req: PendingFriendRequest) => {
        const sender = req.requester;
        const displayName =
          sender.firstName || sender.lastName
            ? [sender.firstName, sender.lastName].filter(Boolean).join(' ')
            : null;
        const busy = accept.isPending || decline.isPending;

        return (
          <div key={req.id} className='flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5'>
            <Avatar username={sender.username} />

            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-white/90'>{sender.username}</p>
              {displayName ? (
                <p className='truncate text-xs text-white/40'>{displayName}</p>
              ) : (
                <p className='text-xs text-white/30'>Wants to be friends</p>
              )}
            </div>

            <div className='flex shrink-0 gap-1.5'>
              <button
                onClick={() => accept.mutate(req.id)}
                disabled={busy}
                className='rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium
                           text-white transition hover:bg-emerald-500 disabled:opacity-40'
              >
                Accept
              </button>
              <button
                onClick={() => decline.mutate(req.id)}
                disabled={busy}
                className='rounded-lg border border-white/10 px-2.5 py-1 text-xs
                           text-white/40 transition hover:bg-white/5 disabled:opacity-40'
              >
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export function FriendsPanel({ onClose }: Props) {
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const { pendingRequests } = useFriendRequests();
  const { friends } = useAllFriends();
  const { onlineFriends } = useOnlineFriends();

  const requestCount = pendingRequests.length;
  const onlineCount = onlineFriends.length;

  return (
    <div
      className='pointer-events-auto absolute bottom-16 right-36 z-20
                 flex w-80 flex-col rounded-2xl border border-white/10
                 bg-black/80 text-white shadow-xl backdrop-blur-md'
      style={{ height: '420px' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div className='flex items-center gap-1.5'>
          <Users className='size-4 text-white/60' />
          <span className='text-sm font-medium'>Friends</span>
          {onlineCount > 0 && (
            <span className='rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400'>
              {onlineCount} online
            </span>
          )}
        </div>
        <button onClick={onClose} className='text-white/40 transition hover:text-white'>
          <X className='size-4' />
        </button>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-white/10'>
        {(
          [
            { key: 'friends', label: 'Friends', count: friends.length },
            { key: 'requests', label: 'Requests', count: requestCount },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs
                        font-medium transition
                        ${
                          tab === key
                            ? 'border-b-2 border-emerald-500 text-white'
                            : 'text-white/40 hover:text-white/70'
                        }`}
          >
            {label}
            {count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                            ${
                              key === 'requests' && count > 0
                                ? 'bg-red-500/80 text-white'
                                : 'bg-white/10 text-white/50'
                            }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-y-auto py-2'>
        {tab === 'friends' ? <FriendsTab /> : <RequestsTab />}
      </div>
    </div>
  );
}

// Re-export icon used in header so the import is self-contained
function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
      <circle cx='9' cy='7' r='4' />
      <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
    </svg>
  );
}
