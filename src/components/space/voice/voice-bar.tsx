import type { PeerState } from '@/hooks/useVoice';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { MicIcon, MicOffIcon, Volume2Icon, Monitor } from 'lucide-react';
import { useScreenShareStore } from '@/store/screen-share.store';

interface VoiceBarProps {
  muted: boolean;
  toggleMute: () => void;
  peers: PeerState[];
  connected: boolean;
  error: string | null;
  onToggleShare?: () => void;
  sharing?: boolean;
}

export function VoiceBar({
  muted,
  toggleMute,
  peers,
  connected,
  error,
  onToggleShare,
  sharing,
}: VoiceBarProps) {
  const { stream, isLocal } = useScreenShareStore();
  const anotherIsSharing = stream !== null && !isLocal;
  const { participants, activeSession, currentAreaZone } = useSessionStore();
  const currentUserId = useAuthStore((s) => s.user?.id);

  // Exclude self from participant display
  const otherParticipants = participants.filter((p) => String(p.userId) !== String(currentUserId));

  return (
    <div
      className='pointer-events-auto absolute bottom-4 left-1/2 z-20
                 -translate-x-1/2 flex items-center gap-3
                 rounded-full border border-white/10 bg-black/70
                 px-4 py-2 text-white backdrop-blur-md shadow-lg'
    >
      {/* Room label — session name or "Common Area" for the lobby */}
      <span className='text-[10px] font-semibold uppercase tracking-widest text-white/30'>
        {activeSession ? activeSession.title : (currentAreaZone?.label ?? 'Common Area')}
      </span>

      <div className='h-4 w-px bg-white/10' />

      {/* Participant avatars — use session list when in a session, LiveKit
          peers when in the lobby (no session participant list available). */}
      {(activeSession ? otherParticipants.length > 0 : peers.length > 0) && (
        <>
          <div className='flex items-center -space-x-1.5'>
            {(activeSession
              ? otherParticipants.slice(0, 6).map((p) => {
                  const peer = peers.find((peer) => peer.userId === String(p.userId));
                  return {
                    key: String(p.userId),
                    label: p.user.username[0].toUpperCase(),
                    title: p.user.username,
                    isSpeaking: peer?.speaking ?? false,
                    isConnected: Boolean(peer),
                  };
                })
              : peers.slice(0, 6).map((p) => ({
                  key: p.userId,
                  label: p.username[0]?.toUpperCase() ?? '?',
                  title: p.username,
                  isSpeaking: p.speaking,
                  isConnected: true,
                }))
            ).map(({ key, label, title, isSpeaking, isConnected }, i, arr) => (
              <div key={key} className='relative' title={title} style={{ zIndex: arr.length - i }}>
                {isSpeaking && (
                  <span className='absolute inset-0 rounded-full animate-ping bg-green-400/40' />
                )}
                <div
                  className={`relative flex h-7 w-7 items-center justify-center
                              rounded-full text-[10px] font-semibold ring-2
                              transition-all duration-200
                              ${
                                isSpeaking
                                  ? 'bg-green-500/90 ring-green-400'
                                  : isConnected
                                    ? 'bg-indigo-500/70 ring-indigo-400/50'
                                    : 'bg-white/10 ring-white/10'
                              }`}
                >
                  {label}
                </div>
              </div>
            ))}

            {(activeSession ? otherParticipants.length : peers.length) > 6 && (
              <div
                className='relative z-10 flex h-7 w-7 items-center justify-center
                           rounded-full bg-white/10 text-[9px] font-medium
                           ring-2 ring-white/10'
              >
                +{(activeSession ? otherParticipants.length : peers.length) - 6}
              </div>
            )}
          </div>

          <div className='h-4 w-px bg-white/10' />
        </>
      )}

      {/* Error */}
      {error && (
        <span className='max-w-[180px] truncate text-xs text-red-400' title={error}>
          {error}
        </span>
      )}

      {/* Connection state label */}
      <div className='flex items-center gap-1.5'>
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors
                     ${connected ? 'bg-green-400' : 'bg-white/20'}`}
        />
        <span className='text-[10px] text-white/40'>
          {connected
            ? peers.length === 0
              ? 'Live · Waiting'
              : `Live · ${peers.length}`
            : 'Connecting…'}
        </span>
        {connected && peers.length > 0 && <Volume2Icon className='size-3 text-white/30' />}
      </div>

      <div className='h-4 w-px bg-white/10' />

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className={`flex h-8 w-8 items-center justify-center rounded-full
                   transition-all duration-150
                   ${
                     muted
                       ? 'bg-red-600/80 ring-1 ring-red-400/50 hover:bg-red-600'
                       : 'bg-white/10 hover:bg-white/20'
                   }`}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MicOffIcon className='size-3.5' /> : <MicIcon className='size-3.5' />}
      </button>

      {onToggleShare && (
        <button
          onClick={onToggleShare}
          disabled={anotherIsSharing}
          title={
            anotherIsSharing
              ? 'Another participant is sharing'
              : sharing
                ? 'Stop screen share'
                : 'Share your screen'
          }
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200
            ${
              anotherIsSharing
                ? 'cursor-not-allowed opacity-30 bg-white/5 text-white/30'
                : sharing
                  ? 'bg-blue-500/30 text-blue-400 ring-1 ring-blue-500/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
        >
          <Monitor size={14} />
        </button>
      )}
    </div>
  );
}
