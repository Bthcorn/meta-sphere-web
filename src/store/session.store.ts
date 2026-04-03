import { create } from 'zustand';
import type { Session, Participant } from '@/types/session';
import type { ZoneKey, ZoneConfig } from '@/config/zone-sessions';

interface SessionState {
  // The session this user is currently inside (null = common area / lobby)
  activeSession: Session | null;

  // Which panel zone the player triggered (near a bookshelf etc.)
  currentZoneKey: ZoneKey | null;
  currentZoneConfig: ZoneConfig | null;

  // Which physical room area the player is standing in (whole-room sensor).
  // Used by the voice bar label and chat context — independent of the panel trigger.
  currentAreaZone: ZoneConfig | null;

  // Participants of the active session (kept fresh by useSession)
  participants: Participant[];

  setActiveSession: (s: Session | null) => void;
  setParticipants: (p: Participant[]) => void;
  enterZone: (key: ZoneKey, config: ZoneConfig) => void;
  exitZone: () => void;
  enterArea: (config: ZoneConfig) => void;
  exitArea: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeSession: null,
  currentZoneKey: null,
  currentZoneConfig: null,
  currentAreaZone: null,
  participants: [],

  setActiveSession: (s) => set({ activeSession: s }),
  setParticipants: (p) => set({ participants: p }),

  enterZone: (key, config) => set({ currentZoneKey: key, currentZoneConfig: config }),
  exitZone: () => set({ currentZoneKey: null, currentZoneConfig: null }),

  enterArea: (config) => set({ currentAreaZone: config }),
  exitArea: () => set({ currentAreaZone: null }),
}));
