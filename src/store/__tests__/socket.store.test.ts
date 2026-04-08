import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSocketStore } from '../socket.store';

// vi.mock is hoisted — use vi.hoisted() for variables referenced inside factories
const { mockSocket, mockSocketManager } = vi.hoisted(() => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    connected: false,
  };
  const mockSocketManager = {
    connect: vi.fn(() => mockSocket),
    disconnect: vi.fn(),
    get instance() {
      return mockSocket;
    },
  };
  return { mockSocket, mockSocketManager };
});

vi.mock('@/lib/socket', () => ({
  socketManager: mockSocketManager,
}));

/** Helper: grab the handler registered for a given socket event. */
function captureHandler(event: string): (...args: unknown[]) => void {
  const call = mockSocket.on.mock.calls.find((args) => args[0] === event);
  if (!call) throw new Error(`No handler registered for event "${event}"`);
  return call[1] as (...args: unknown[]) => void;
}

describe('useSocketStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    useSocketStore.setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      currentRoomId: null,
    });
  });

  // ── connect ────────────────────────────────────────────────────────────────

  describe('connect', () => {
    it('sets isConnecting:true immediately', () => {
      useSocketStore.getState().connect('my-token');
      expect(useSocketStore.getState().isConnecting).toBe(true);
    });

    it('clears any previous error', () => {
      useSocketStore.setState({ error: 'old error' });
      useSocketStore.getState().connect('my-token');
      expect(useSocketStore.getState().error).toBeNull();
    });

    it('calls socketManager.connect with the token', () => {
      useSocketStore.getState().connect('my-token');
      expect(mockSocketManager.connect).toHaveBeenCalledWith('my-token');
    });

    it('registers connect, disconnect, and connect_error handlers on the socket', () => {
      useSocketStore.getState().connect('my-token');
      const events = mockSocket.on.mock.calls.map((args) => args[0] as string);
      expect(events).toContain('connect');
      expect(events).toContain('disconnect');
      expect(events).toContain('connect_error');
    });

    it('sets isConnected:true immediately when socket is already connected', () => {
      mockSocket.connected = true;
      useSocketStore.getState().connect('my-token');
      expect(useSocketStore.getState().isConnected).toBe(true);
      expect(useSocketStore.getState().isConnecting).toBe(false);
    });
  });

  // ── connect event ──────────────────────────────────────────────────────────

  describe('on connect event', () => {
    it('sets isConnected:true and isConnecting:false', () => {
      useSocketStore.getState().connect('my-token');
      const handler = captureHandler('connect');
      handler();
      expect(useSocketStore.getState().isConnected).toBe(true);
      expect(useSocketStore.getState().isConnecting).toBe(false);
    });
  });

  // ── disconnect event ───────────────────────────────────────────────────────

  describe('on disconnect event', () => {
    it('sets isConnected:false', () => {
      useSocketStore.getState().connect('my-token');
      captureHandler('connect')(); // simulate connect first
      captureHandler('disconnect')();
      expect(useSocketStore.getState().isConnected).toBe(false);
    });
  });

  // ── connect_error event ────────────────────────────────────────────────────

  describe('on connect_error event', () => {
    it('stores the error message and clears isConnecting', () => {
      useSocketStore.getState().connect('my-token');
      const handler = captureHandler('connect_error');
      handler(new Error('Network timeout'));
      expect(useSocketStore.getState().error).toBe('Network timeout');
      expect(useSocketStore.getState().isConnecting).toBe(false);
    });

    it('converts a non-Error argument to a string message', () => {
      useSocketStore.getState().connect('my-token');
      captureHandler('connect_error')('some string error');
      expect(useSocketStore.getState().error).toBe('some string error');
    });
  });

  // ── disconnect ─────────────────────────────────────────────────────────────

  describe('disconnect', () => {
    it('calls socketManager.disconnect', () => {
      useSocketStore.getState().disconnect();
      expect(mockSocketManager.disconnect).toHaveBeenCalledOnce();
    });

    it('resets isConnected, isConnecting, and currentRoomId', () => {
      useSocketStore.setState({ isConnected: true, isConnecting: false, currentRoomId: 'room-1' });
      useSocketStore.getState().disconnect();
      const s = useSocketStore.getState();
      expect(s.isConnected).toBe(false);
      expect(s.isConnecting).toBe(false);
      expect(s.currentRoomId).toBeNull();
    });

    it('removes socket event listeners', () => {
      useSocketStore.getState().connect('my-token');
      vi.clearAllMocks(); // reset call counts
      useSocketStore.getState().disconnect();
      // off should be called for connect, disconnect, connect_error
      const offEvents = mockSocket.off.mock.calls.map((args) => args[0] as string);
      expect(offEvents).toContain('connect');
      expect(offEvents).toContain('disconnect');
      expect(offEvents).toContain('connect_error');
    });
  });

  // ── setCurrentRoom ─────────────────────────────────────────────────────────

  describe('setCurrentRoom', () => {
    it('updates currentRoomId', () => {
      useSocketStore.getState().setCurrentRoom('room-42');
      expect(useSocketStore.getState().currentRoomId).toBe('room-42');
    });

    it('accepts null to clear the room', () => {
      useSocketStore.setState({ currentRoomId: 'room-42' });
      useSocketStore.getState().setCurrentRoom(null);
      expect(useSocketStore.getState().currentRoomId).toBeNull();
    });
  });
});
