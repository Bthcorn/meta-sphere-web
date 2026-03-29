import { useSessionStore } from '@/store/session.store';
import { MeetingPanel } from './zone-panels/meeting-panel';

export function ZonePanel() {
  const { currentZoneConfig, activeSession, exitZone } = useSessionStore();

  // Don't show when inside a session or not in a zone
  if (!currentZoneConfig || activeSession) return null;

  return (
    <div
      className='pointer-events-auto absolute right-4 top-1/2 z-20 w-72
                  -translate-y-1/2 rounded-2xl border border-white/10
                  bg-black/65 p-4 text-white shadow-xl backdrop-blur-md'
    >
      <div className='flex flex-col gap-3'>
        <button
          onClick={exitZone}
          className='flex w-fit items-center gap-1 text-xs text-white/40
                     transition hover:text-white/70'
        >
          ← Exit
        </button>
        {currentZoneConfig.mode === 'multi' ? (
          <MeetingPanel />
        ) : (
          <div className='text-xs text-white/40'>
            {currentZoneConfig.label} — sessions coming soon
          </div>
        )}
      </div>
    </div>
  );
}
