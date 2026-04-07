import { Users } from 'lucide-react';
import { useSessionInviteStore } from '@/store/session-invites.store';
import { useSession } from '@/hooks/useSession';

export function SessionInviteToast() {
  const { pendingInvites, dismissInvite } = useSessionInviteStore();
  const { joinSession } = useSession();

  if (pendingInvites.length === 0) return null;

  return (
    <div className='fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none'>
      {pendingInvites.map((invite) => (
        <div
          key={invite.sessionId}
          className='pointer-events-auto flex min-w-[260px] items-start gap-3 rounded-xl
                     border border-violet-500/30 bg-[#12122a]/95 p-3 shadow-2xl backdrop-blur-md
                     animate-in slide-in-from-right-4 duration-200'
        >
          {/* Icon */}
          <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20'>
            <Users className='h-4 w-4 text-violet-400' />
          </div>

          {/* Text */}
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold uppercase tracking-widest text-violet-400'>
              Session invite
            </p>
            <p className='mt-0.5 truncate text-sm font-medium text-white'>{invite.sessionTitle}</p>
            <p className='text-xs capitalize text-white/40'>{invite.sessionType.toLowerCase()}</p>
          </div>

          {/* Actions */}
          <div className='flex shrink-0 flex-col gap-1.5'>
            <button
              onClick={() => {
                joinSession.mutate({
                  sessionId: invite.sessionId,
                  inviteToken: invite.inviteToken,
                });
                dismissInvite(invite.sessionId);
              }}
              disabled={joinSession.isPending}
              className='rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium
                         text-white transition hover:bg-violet-500 disabled:opacity-40'
            >
              Join
            </button>
            <button
              onClick={() => dismissInvite(invite.sessionId)}
              className='rounded-lg border border-white/10 px-3 py-1 text-xs
                         text-white/40 transition hover:bg-white/5'
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
