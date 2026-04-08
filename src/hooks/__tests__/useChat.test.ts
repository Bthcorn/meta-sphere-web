import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChat } from '../useChat';
import { messagesApi } from '@/api/messages.api';
import { useChatStore } from '@/store/chat.store';

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockSocket, mockSocketEmit, getMockIsConnected, setMockIsConnected } = vi.hoisted(() => {
  let connected = true;
  return {
    mockSocket: { on: vi.fn(), off: vi.fn() },
    mockSocketEmit: vi.fn(),
    getMockIsConnected: () => connected,
    setMockIsConnected: (v: boolean) => {
      connected = v;
    },
  };
});

vi.mock('@/lib/socket-manager', () => ({
  socketManager: {
    instance: mockSocket,
    emit: mockSocketEmit,
  },
}));

vi.mock('@/store/socket.store', () => ({
  useSocketStore: vi.fn((sel: (s: { isConnected: boolean }) => unknown) =>
    sel({ isConnected: getMockIsConnected() })
  ),
}));

// Mock session store — defaults to no active session, no area zone
const mockSessionState = {
  activeSession: null as null | { id: string; title: string },
  currentZoneConfig: null as null | { roomId: string },
  currentAreaZone: null as null | { roomId: string; label: string },
};

vi.mock('@/store/session.store', () => ({
  // useChatContext calls useSessionStore() without a selector (destructures full state),
  // so the mock must handle both the no-selector and selector call patterns.
  useSessionStore: vi.fn((sel?: (s: typeof mockSessionState) => unknown) =>
    sel ? sel(mockSessionState) : mockSessionState
  ),
}));

// Mock zone config so we don't depend on env vars
vi.mock('@/config/zone-sessions', () => ({
  ZONE_CONFIG: {
    zone_chilling: { roomId: 'room-chilling', label: 'Chill Zone' },
  },
}));

vi.mock('@/api/messages.api', () => ({
  messagesApi: {
    getRoomMessages: vi.fn(),
    getSessionMessages: vi.fn(),
  },
}));

const mockGetRoomMessages = vi.mocked(messagesApi.getRoomMessages);
const mockGetSessionMessages = vi.mocked(messagesApi.getSessionMessages);

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { Wrapper };
}

function makeMessage(overrides = {}) {
  return {
    id: 'msg-1',
    content: 'Hello',
    type: 'TEXT' as const,
    isDeleted: false,
    isEdited: false,
    reactions: {},
    createdAt: '2024-01-01T00:00:00Z',
    roomId: 'room-chilling',
    sessionId: null,
    receiverId: null,
    sender: { id: 'user-1', username: 'alice' },
    ...overrides,
  };
}

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockIsConnected(true);
    mockSessionState.activeSession = null;
    mockSessionState.currentZoneConfig = null;
    mockSessionState.currentAreaZone = null;
    useChatStore.setState({ messagesByContext: {}, typingByContext: {} });
    mockGetRoomMessages.mockResolvedValue([]);
    mockGetSessionMessages.mockResolvedValue([]);
  });

  // ── Context derivation ─────────────────────────────────────────────────────

  describe('context derivation', () => {
    it('uses room context (chilling zone fallback) when no active session', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });
      expect(result.current.ctx?.type).toBe('room');
      expect(result.current.ctx?.contextKey).toBe('room:room-chilling');
    });

    it('uses the current area zone roomId when player is standing in one', () => {
      mockSessionState.currentAreaZone = { roomId: 'room-study', label: 'Study Zone' };
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });
      expect(result.current.ctx?.contextKey).toBe('room:room-study');
    });

    it('uses session context when there is an active session', () => {
      mockSessionState.activeSession = { id: 'sess-1', title: 'Team Meeting' };
      mockSessionState.currentZoneConfig = { roomId: 'room-meeting' };
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });
      expect(result.current.ctx?.type).toBe('session');
      expect(result.current.ctx?.contextKey).toBe('session:sess-1');
    });
  });

  // ── History loading ────────────────────────────────────────────────────────

  describe('history loading', () => {
    it('fetches room messages and stores them in chat store', async () => {
      const msgs = [makeMessage()];
      mockGetRoomMessages.mockResolvedValueOnce(msgs);
      const { Wrapper } = createWrapper();

      renderHook(() => useChat(), { wrapper: Wrapper });

      await waitFor(() =>
        expect(useChatStore.getState().messagesByContext['room:room-chilling']).toEqual(msgs)
      );
    });

    it('fetches session messages when an active session is present', async () => {
      mockSessionState.activeSession = { id: 'sess-1', title: 'Meeting' };
      mockSessionState.currentZoneConfig = { roomId: 'room-meeting' };
      const msgs = [makeMessage({ roomId: null, sessionId: 'sess-1' })];
      mockGetSessionMessages.mockResolvedValueOnce(msgs);
      const { Wrapper } = createWrapper();

      renderHook(() => useChat(), { wrapper: Wrapper });

      await waitFor(() =>
        expect(useChatStore.getState().messagesByContext['session:sess-1']).toEqual(msgs)
      );
    });
  });

  // ── Socket join / leave ────────────────────────────────────────────────────

  describe('socket room management', () => {
    it('emits chat:join on mount when connected', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });
      expect(mockSocketEmit).toHaveBeenCalledWith('chat:join', { roomId: 'room-chilling' });
    });

    it('emits chat:leave on unmount', () => {
      const { Wrapper } = createWrapper();
      const { unmount } = renderHook(() => useChat(), { wrapper: Wrapper });
      unmount();
      expect(mockSocketEmit).toHaveBeenCalledWith('chat:leave', { roomId: 'room-chilling' });
    });

    it('does not emit chat:join when socket is disconnected', () => {
      setMockIsConnected(false);
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });
      expect(mockSocketEmit).not.toHaveBeenCalledWith('chat:join', expect.anything());
    });
  });

  // ── Socket listeners ───────────────────────────────────────────────────────

  describe('socket listeners', () => {
    it('registers chat:message, chat:typing, chat:reaction listeners', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });
      const events = mockSocket.on.mock.calls.map(([e]: [string]) => e);
      expect(events).toContain('chat:message');
      expect(events).toContain('chat:typing');
      expect(events).toContain('chat:reaction');
    });

    it('unregisters listeners on unmount', () => {
      const { Wrapper } = createWrapper();
      const { unmount } = renderHook(() => useChat(), { wrapper: Wrapper });
      unmount();
      const events = mockSocket.off.mock.calls.map(([e]: [string]) => e);
      expect(events).toContain('chat:message');
      expect(events).toContain('chat:typing');
      expect(events).toContain('chat:reaction');
    });

    it('adds incoming message to chat store for the current context', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        ([e]: [string]) => e === 'chat:message'
      )![1] as (m: ReturnType<typeof makeMessage>) => void;

      act(() => handler(makeMessage({ id: 'msg-new', roomId: 'room-chilling' })));

      expect(useChatStore.getState().messagesByContext['room:room-chilling']).toContainEqual(
        expect.objectContaining({ id: 'msg-new' })
      );
    });

    it('sets typing indicator in chat store', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        ([e]: [string]) => e === 'chat:typing'
      )![1] as (u: { userId: string; username: string; isTyping: boolean }) => void;

      act(() => handler({ userId: 'user-2', username: 'bob', isTyping: true }));

      const typing = useChatStore.getState().typingByContext['room:room-chilling'];
      expect(typing).toContainEqual(expect.objectContaining({ userId: 'user-2', isTyping: true }));
    });

    it('updates reactions in chat store', () => {
      useChatStore.setState({
        messagesByContext: {
          'room:room-chilling': [makeMessage({ id: 'msg-1', reactions: {} })],
        },
        typingByContext: {},
      });
      const { Wrapper } = createWrapper();
      renderHook(() => useChat(), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        ([e]: [string]) => e === 'chat:reaction'
      )![1] as (r: { messageId: string; reactions: Record<string, string[]> }) => void;

      act(() => handler({ messageId: 'msg-1', reactions: { '👍': ['user-1'] } }));

      const msg = useChatStore.getState().messagesByContext['room:room-chilling'][0];
      expect(msg.reactions).toEqual({ '👍': ['user-1'] });
    });
  });

  // ── sendMessage / sendTyping ───────────────────────────────────────────────

  describe('sendMessage', () => {
    it('emits chat:send with trimmed content and roomId', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

      act(() => result.current.sendMessage('  Hello world  '));

      expect(mockSocketEmit).toHaveBeenCalledWith('chat:send', {
        content: 'Hello world',
        roomId: 'room-chilling',
        sessionId: undefined,
      });
    });

    it('does not emit when content is blank', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

      act(() => result.current.sendMessage('   '));

      expect(mockSocketEmit).not.toHaveBeenCalledWith('chat:send', expect.anything());
    });
  });

  describe('sendTyping', () => {
    it('emits chat:typing with isTyping flag and roomId', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

      act(() => result.current.sendTyping(true));

      expect(mockSocketEmit).toHaveBeenCalledWith('chat:typing', {
        roomId: 'room-chilling',
        sessionId: undefined,
        isTyping: true,
      });
    });
  });
});
