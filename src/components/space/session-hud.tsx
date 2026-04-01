import { useSession } from '@/hooks/useSession';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { useVoiceStore } from '@/store/voice.store';

export function SessionHUD() {
  const { activeSession, participants, leaveSession, startSession, endSession } = useSession();
  const userId = String(useAuthStore((s) => s.user?.id ?? ''));
  const { currentZoneConfig } = useSessionStore();
  const speakingUserIds = useVoiceStore((s) => s.speakingUserIds);

  if (!activeSession) return null;

  const isHost = activeSession.hostId === userId;
  const isScheduled = activeSession.status === 'SCHEDULED';
  const isActive = activeSession.status === 'ACTIVE';
  const activeCount = participants.length;
  const previewParticipants = participants.slice(0, 5);

  return (
    <div
      className='pointer-events-auto absolute left-1/2 top-4 z-20
                  -translate-x-1/2 flex items-center gap-3 rounded-full
                  border border-white/10 bg-black/65 px-4 py-2
                  text-white shadow-lg backdrop-blur-md'
    >
      {/* Status dot + name */}
      <div className='flex items-center gap-2'>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            isActive ? 'animate-pulse bg-green-400' : 'bg-yellow-400'
          }`}
        />
        <span className='max-w-[160px] truncate text-sm font-medium'>{activeSession.title}</span>
        {currentZoneConfig && (
          <span className='text-xs text-white/40'>{currentZoneConfig.label}</span>
        )}
      </div>

      {/* Participant avatar stack */}
      {activeCount > 0 && (
        <div className='flex items-center gap-1'>
          <div className='flex -space-x-1.5'>
            {previewParticipants.map((p) => {
              const isSpeaking = speakingUserIds.has(String(p.userId));
              return (
                <div key={p.userId} className='relative' title={p.user.username}>
                  {isSpeaking && (
                    <span className='absolute inset-0 rounded-full animate-ping bg-green-400/50' />
                  )}
                  <div
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full
                               text-[10px] font-medium ring-1 transition-colors duration-150
                               ${isSpeaking ? 'bg-green-600 ring-green-400' : 'bg-blue-600 ring-black'}`}
                  >
                    {p.user.username[0]?.toUpperCase() ?? '?'}
                  </div>
                </div>
              );
            })}
          </div>
          {activeCount > 5 && <span className='text-xs text-white/40'>+{activeCount - 5}</span>}
        </div>
      )}

      {/* Divider */}
      <div className='h-4 w-px bg-white/10' />

      {/* Host controls */}
      {isHost && isScheduled && (
        <button
          onClick={() => startSession.mutate(activeSession.id)}
          disabled={startSession.isPending}
          className='rounded-full bg-green-600 px-3 py-1 text-xs font-medium
                     hover:bg-green-500 disabled:opacity-50'
        >
          Start
        </button>
      )}
      {isHost && isActive && (
        <button
          onClick={() => endSession.mutate(activeSession.id)}
          disabled={endSession.isPending}
          className='rounded-full bg-red-600/80 px-3 py-1 text-xs font-medium
                     hover:bg-red-600 disabled:opacity-50'
        >
          End session
        </button>
      )}

      {/* Non-host leave */}
      {!isHost && (
        <button
          onClick={() => leaveSession.mutate()}
          disabled={leaveSession.isPending}
          className='rounded-full border border-white/20 px-3 py-1 text-xs
                     text-white/60 hover:bg-white/10 disabled:opacity-40'
        >
          Leave
        </button>
      )}
    </div>
  );
}
