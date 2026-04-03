import type { SessionType } from '@/types/session';

export type ZoneMode = 'multi' | 'single';

export interface ZoneConfig {
  roomId: string; // DB Room UUID — set after seeding
  sessionType: SessionType;
  mode: ZoneMode;
  label: string;
  description: string;
}

// After running your seed script, replace these placeholder UUIDs.
// You can also set them via env vars: import.meta.env.VITE_ROOM_MEETING_A_ID
export const ZONE_CONFIG = {
  zone_meeting_a: {
    roomId: import.meta.env.VITE_ROOM_MEETING_A_ID ?? 'REPLACE_MEETING_A_UUID',
    sessionType: 'MEETING' as SessionType,
    mode: 'multi' as ZoneMode,
    label: 'Room A',
    description: 'Meeting room — multiple sessions',
  },
  zone_meeting_b: {
    roomId: import.meta.env.VITE_ROOM_MEETING_B_ID ?? 'REPLACE_MEETING_B_UUID',
    sessionType: 'MEETING' as SessionType,
    mode: 'multi' as ZoneMode,
    label: 'Room B',
    description: 'Meeting room — multiple sessions',
  },
  zone_lecture: {
    roomId: import.meta.env.VITE_ROOM_LECTURE_ID ?? 'REPLACE_LECTURE_UUID',
    sessionType: 'MEETING' as SessionType,
    mode: 'single' as ZoneMode,
    label: 'Lecture Hall',
    description: 'One session at a time',
  },
  zone_library: {
    roomId: import.meta.env.VITE_ROOM_LIBRARY_ID ?? 'REPLACE_LIBRARY_UUID',
    sessionType: 'STUDY' as SessionType,
    mode: 'single' as ZoneMode,
    label: 'Library',
    description: 'Study session',
  },
  zone_chilling: {
    roomId: import.meta.env.VITE_ROOM_CHILLING_ID ?? 'REPLACE_CHILLING_UUID',
    sessionType: 'SOCIAL' as SessionType,
    mode: 'single' as ZoneMode,
    label: 'Chill Zone',
    description: 'Hangout',
  },
  // zone_private: {
  //   roomId: import.meta.env.VITE_ROOM_PRIVATE_ID ?? 'REPLACE_PRIVATE_UUID',
  //   sessionType: 'WORKSHOP' as SessionType,
  //   mode: 'single' as ZoneMode,
  //   label: 'Private Room',
  //   description: 'Workshop',
  // },
} satisfies Record<string, ZoneConfig>;

export type ZoneKey = keyof typeof ZONE_CONFIG;
