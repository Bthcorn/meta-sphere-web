import { useEffect } from 'react';
import { useSessionStore } from '@/store/session.store';
import { ZONE_CONFIG } from '@/config/zone-sessions';
import { MeetingPanel } from './zone-panels/meeting-panel';
import { LibraryPanel } from '@/components/library/library-panel';

export function ZonePanel() {
  const { currentZoneConfig, activeSession, exitZone } = useSessionStore();

  // Press Escape to exit the zone panel
  useEffect(() => {
    if (!currentZoneConfig) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitZone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentZoneConfig, exitZone]);

  // Don't show when inside a session or not in a zone
  if (!currentZoneConfig || activeSession) return null;

  const isLibrary = currentZoneConfig === ZONE_CONFIG.zone_library;

  return (
    <div
      className={`pointer-events-auto absolute z-20 rounded-2xl border border-white/10
                  bg-black/65 p-4 text-white shadow-xl backdrop-blur-md
                  ${
                    isLibrary
                      ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[75vh] flex flex-col overflow-hidden'
                      : 'right-4 top-1/2 -translate-y-1/2 w-72'
                  }`}
    >
      <div className='flex flex-col gap-3 h-full'>
        <button
          onClick={exitZone}
          className='flex w-fit items-center gap-1 text-xs text-white/40
                     transition hover:text-white/70'
        >
          ← Exit
        </button>
        {currentZoneConfig.mode === 'multi' ? (
          <MeetingPanel />
        ) : currentZoneConfig === ZONE_CONFIG.zone_library ? (
          <LibraryPanel />
        ) : (
          <div className='text-xs text-white/40'>
            {currentZoneConfig.label} — sessions coming soon
          </div>
        )}
      </div>
    </div>
  );
}
