import { useVoice } from '@/hooks/useVoice';
import { useSessionStore } from '@/store/session.store';
import { MicIcon, MicOffIcon } from 'lucide-react';

export function VoiceBar() {
  const { muted, toggleMute, peers, error } = useVoice();
  const { participants } = useSessionStore();

  return (
    <div
      className='pointer-events-auto absolute bottom-4 left-1/2 z-20
                  -translate-x-1/2 flex items-center gap-3
                  rounded-full border border-white/10 bg-black/70
                  px-3 py-2 text-white backdrop-blur-md'
    >
      {/* Connected peers */}
      {participants.length > 0 && (
        <>
          <div className='flex items-center gap-1.5'>
            {participants.slice(0, 6).map((p) => {
              const isConnected = peers.some((peer) => peer.userId === p.userId);
              return (
                <div key={p.userId} className='flex flex-col items-center gap-0.5'>
                  <div
                    className={`h-6 w-6 rounded-full text-[9px] font-medium
                                 flex items-center justify-center ring-1
                                 ${
                                   isConnected
                                     ? 'bg-green-600/80 ring-green-400/50'
                                     : 'bg-white/10 ring-white/10'
                                 }`}
                    title={p.user.username}
                  >
                    {p.user.username[0].toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className='h-4 w-px bg-white/10' />
        </>
      )}

      {error && <span className='text-xs text-red-400'>{error}</span>}

      <button
        onClick={toggleMute}
        className={`flex h-9 w-9 items-center justify-center rounded-full
                    transition-all
                    ${
                      muted
                        ? 'bg-red-600/80 ring-1 ring-red-400/50 hover:bg-red-600'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MicOffIcon className='size-4' /> : <MicIcon className='size-4' />}
      </button>

      <span className='text-xs text-white/40'>{peers.length} connected</span>
    </div>
  );
}
