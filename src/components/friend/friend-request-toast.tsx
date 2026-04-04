import { UserPlus } from 'lucide-react';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { colorFromUsername } from '@/lib/avatar-utils';

function RequesterAvatar({ username }: { username: string }) {
  const color = colorFromUsername(username);
  return (
    <div
      className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                 text-sm font-bold text-white'
      style={{ backgroundColor: color }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

/**
 * Floating toast cards for incoming friend requests.
 * Mount once at the space / meeting layout level alongside SessionInviteToast.
 *
 * Requests are polled from GET /api/friends/requests every 30 s.
 * Once accepted or declined the card disappears immediately (optimistic via
 * TanStack Query invalidation).
 */
export function FriendRequestToast() {
  const { pendingRequests, accept, decline } = useFriendRequests();

  if (pendingRequests.length === 0) return null;

  return (
    <div className='fixed bottom-20 left-4 z-50 flex flex-col gap-2 pointer-events-none'>
      {pendingRequests.map((req) => {
        const sender = req.requester;
        const displayName =
          sender.firstName || sender.lastName
            ? [sender.firstName, sender.lastName].filter(Boolean).join(' ')
            : null;

        return (
          <div
            key={req.id}
            className='pointer-events-auto flex min-w-[260px] items-start gap-3 rounded-xl
                       border border-emerald-500/30 bg-[#0e1a12]/95 p-3 shadow-2xl
                       backdrop-blur-md animate-in slide-in-from-left-4 duration-200'
          >
            {/* Avatar */}
            <RequesterAvatar username={sender.username} />

            {/* Text */}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-1.5'>
                <UserPlus className='h-3 w-3 shrink-0 text-emerald-400' />
                <p className='text-[11px] font-semibold uppercase tracking-widest text-emerald-400'>
                  Friend request
                </p>
              </div>
              <p className='mt-0.5 truncate text-sm font-medium text-white'>{sender.username}</p>
              {displayName && <p className='truncate text-xs text-white/40'>{displayName}</p>}
            </div>

            {/* Actions */}
            <div className='flex shrink-0 flex-col gap-1.5'>
              <button
                onClick={() => accept.mutate(req.id)}
                disabled={accept.isPending || decline.isPending}
                className='rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium
                           text-white transition hover:bg-emerald-500 disabled:opacity-40'
              >
                Accept
              </button>
              <button
                onClick={() => decline.mutate(req.id)}
                disabled={accept.isPending || decline.isPending}
                className='rounded-lg border border-white/10 px-3 py-1 text-xs
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
