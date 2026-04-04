import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from '../useSession';
import { useSessionStore } from '@/store/session.store';
import { sessionsApi } from '@/api/sessions.api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/api/sessions.api', () => ({
  sessionsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    start: vi.fn(),
    end: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    getParticipants: vi.fn(),
    kick: vi.fn(),
  },
}));

vi.mock('@/lib/socket-manager', () => ({
  socketManager: { instance: null, emit: vi.fn() },
}));

vi.mock('@/store/space-presence.store', () => ({
  useSpacePresenceStore: {
    getState: () => ({ lastPosition: null }),
  },
}));

const mockClearStream = vi.hoisted(() => vi.fn());

vi.mock('@/store/screen-share.store', () => ({
  useScreenShareStore: {
    getState: vi.fn(() => ({ clearStream: mockClearStream })),
  },
}));

const mockApi = vi.mocked(sessionsApi);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockSession = {
  id: 'session-1',
  title: 'Team Standup',
  type: 'MEETING' as const,
  status: 'SCHEDULED' as const,
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

const multiZoneConfig = {
  roomId: 'room-1',
  sessionType: 'MEETING' as const,
  mode: 'multi' as const,
  label: 'Room A',
  description: 'Meeting room',
};

const singleZoneConfig = {
  roomId: 'room-2',
  sessionType: 'MEETING' as const,
  mode: 'single' as const,
  label: 'Lecture Hall',
  description: 'One session at a time',
};

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------
function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClearStream.mockReset();
    useSessionStore.getState().exitZone();
    useSessionStore.getState().setActiveSession(null);
    mockApi.getParticipants.mockResolvedValue([]);
  });

  describe('initial state', () => {
    it('returns isInSession=false and mode=null when no zone is set', () => {
      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      expect(result.current.isInSession).toBe(false);
      expect(result.current.mode).toBeNull();
      expect(result.current.activeSession).toBeNull();
    });

    it('reflects mode from the current zone config', () => {
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      expect(result.current.mode).toBe('multi');
    });
  });

  describe('sessionList query (multi mode)', () => {
    it('returns filtered SCHEDULED/ACTIVE sessions', async () => {
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      const endedSession = { ...mockSession, id: 'session-2', status: 'ENDED' as const };
      mockApi.list.mockResolvedValue([mockSession, endedSession]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.sessionList).toEqual([mockSession]);
    });

    it('sessionList stays empty when mode is single', async () => {
      useSessionStore.getState().enterZone('zone_lecture', singleZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // sessionList query is disabled in single mode — always returns the default []
      expect(result.current.sessionList).toEqual([]);
    });
  });

  describe('singleSession query (single mode)', () => {
    it('returns the first SCHEDULED/ACTIVE session', async () => {
      useSessionStore.getState().enterZone('zone_lecture', singleZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.singleSession).toEqual(mockSession);
    });

    it('returns null when no active session exists', async () => {
      useSessionStore.getState().enterZone('zone_lecture', singleZoneConfig);
      mockApi.list.mockResolvedValue([]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.singleSession).toBeNull();
    });
  });

  describe('leaveSession mutation', () => {
    it('calls sessionsApi.leave and clears active session', async () => {
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);
      mockApi.leave.mockResolvedValue({ message: 'Left' });

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.leaveSession.mutateAsync();
      });

      expect(mockApi.leave).toHaveBeenCalledWith('session-1');
      expect(useSessionStore.getState().activeSession).toBeNull();
    });

    it('clears screen share stream on leave', async () => {
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);
      mockApi.leave.mockResolvedValue({ message: 'Left' });

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.leaveSession.mutateAsync();
      });

      expect(mockClearStream).toHaveBeenCalled();
    });
  });

  describe('startSession mutation', () => {
    it('calls sessionsApi.start and updates active session when ids match', async () => {
      const startedSession = { ...mockSession, status: 'ACTIVE' as const };
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);
      mockApi.start.mockResolvedValue(startedSession);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.startSession.mutateAsync('session-1');
      });

      expect(mockApi.start).toHaveBeenCalledWith('session-1');
      expect(useSessionStore.getState().activeSession).toEqual(startedSession);
    });

    it('does not update store when a different session is started', async () => {
      const otherSession = { ...mockSession, id: 'session-2' };
      const startedOther = { ...otherSession, status: 'ACTIVE' as const };
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession, otherSession]);
      mockApi.start.mockResolvedValue(startedOther);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.startSession.mutateAsync('session-2');
      });

      // Active session should remain unchanged (it's session-1, not session-2)
      expect(useSessionStore.getState().activeSession).toEqual(mockSession);
    });
  });

  describe('endSession mutation', () => {
    it('calls sessionsApi.end and clears active session', async () => {
      const endedSession = { ...mockSession, status: 'ENDED' as const };
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);
      mockApi.end.mockResolvedValue(endedSession);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.endSession.mutateAsync('session-1');
      });

      expect(mockApi.end).toHaveBeenCalledWith('session-1');
      expect(useSessionStore.getState().activeSession).toBeNull();
    });

    it('clears screen share stream on end', async () => {
      const endedSession = { ...mockSession, status: 'ENDED' as const };
      useSessionStore.getState().setActiveSession(mockSession);
      useSessionStore.getState().enterZone('zone_meeting_a', multiZoneConfig);
      mockApi.list.mockResolvedValue([mockSession]);
      mockApi.end.mockResolvedValue(endedSession);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.endSession.mutateAsync('session-1');
      });

      expect(mockClearStream).toHaveBeenCalled();
    });
  });

  describe('participants', () => {
    it('returns only ACTIVE participants', async () => {
      const leftParticipant = { ...mockParticipant, userId: 'user-2', status: 'LEFT' as const };
      useSessionStore.getState().setActiveSession(mockSession);
      mockApi.getParticipants.mockResolvedValue([mockParticipant, leftParticipant]);

      const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.participants).toEqual([mockParticipant]);
      });
    });
  });
});
