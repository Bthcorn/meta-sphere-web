import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../session.store';

const mockSession = {
  id: 'session-1',
  title: 'Team Standup',
  type: 'MEETING' as const,
  status: 'ACTIVE' as const,
  hostId: 'user-1',
  roomId: 'room-1',
  isLocked: false,
  hasPassword: false,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockParticipant = {
  userId: 'user-1',
  sessionId: 'session-1',
  role: 'HOST' as const,
  status: 'ACTIVE' as const,
  joinedAt: '2024-01-01T00:00:00Z',
  user: { id: 'user-1', username: 'johndoe' },
};

const mockZoneConfig = {
  roomId: 'room-1',
  sessionType: 'MEETING' as const,
  mode: 'multi' as const,
  label: 'Room A',
  description: 'Meeting room',
};

describe('useSessionStore', () => {
  beforeEach(() => {
    const { exitZone, setActiveSession, setParticipants } = useSessionStore.getState();
    exitZone();
    setActiveSession(null);
    setParticipants([]);
  });

  it('starts with null active session and no zone', () => {
    const { activeSession, currentZoneKey, currentZoneConfig, participants } =
      useSessionStore.getState();

    expect(activeSession).toBeNull();
    expect(currentZoneKey).toBeNull();
    expect(currentZoneConfig).toBeNull();
    expect(participants).toEqual([]);
  });

  describe('setActiveSession', () => {
    it('stores the session', () => {
      useSessionStore.getState().setActiveSession(mockSession);

      expect(useSessionStore.getState().activeSession).toEqual(mockSession);
    });

    it('clears the session when set to null', () => {
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().setActiveSession(null);

      expect(useSessionStore.getState().activeSession).toBeNull();
    });
  });

  describe('setParticipants', () => {
    it('stores the participants list', () => {
      useSessionStore.getState().setParticipants([mockParticipant]);

      expect(useSessionStore.getState().participants).toEqual([mockParticipant]);
    });

    it('replaces the list on subsequent calls', () => {
      const second = { ...mockParticipant, userId: 'user-2' };

      useSessionStore.getState().setParticipants([mockParticipant]);
      useSessionStore.getState().setParticipants([second]);

      expect(useSessionStore.getState().participants).toEqual([second]);
    });
  });

  describe('enterZone', () => {
    it('stores the zone key and config', () => {
      useSessionStore.getState().enterZone('zone_meeting_a', mockZoneConfig);

      const { currentZoneKey, currentZoneConfig } = useSessionStore.getState();
      expect(currentZoneKey).toBe('zone_meeting_a');
      expect(currentZoneConfig).toEqual(mockZoneConfig);
    });

    it('updates zone when entering a different zone', () => {
      const lectureConfig = {
        roomId: 'room-2',
        sessionType: 'MEETING' as const,
        mode: 'single' as const,
        label: 'Lecture Hall',
        description: 'One session at a time',
      };

      useSessionStore.getState().enterZone('zone_meeting_a', mockZoneConfig);
      useSessionStore.getState().enterZone('zone_lecture', lectureConfig);

      const { currentZoneKey, currentZoneConfig } = useSessionStore.getState();
      expect(currentZoneKey).toBe('zone_lecture');
      expect(currentZoneConfig).toEqual(lectureConfig);
    });
  });

  describe('exitZone', () => {
    it('clears the zone key and config', () => {
      useSessionStore.getState().enterZone('zone_meeting_a', mockZoneConfig);
      useSessionStore.getState().exitZone();

      const { currentZoneKey, currentZoneConfig } = useSessionStore.getState();
      expect(currentZoneKey).toBeNull();
      expect(currentZoneConfig).toBeNull();
    });

    it('does not affect the active session', () => {
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', mockZoneConfig);
      useSessionStore.getState().exitZone();

      expect(useSessionStore.getState().activeSession).toEqual(mockSession);
    });
  });
});
