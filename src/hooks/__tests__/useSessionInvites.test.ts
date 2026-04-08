import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionInvites } from '../useSessionInvites';
import { useSessionInviteStore } from '@/store/session-invites.store';
import type { SessionInvite } from '@/types/session';

// vi.mock is hoisted — use vi.hoisted() to safely create variables referenced inside factories
const { mockSocket } = vi.hoisted(() => ({
  mockSocket: { on: vi.fn(), off: vi.fn() },
}));

vi.mock('@/lib/socket-manager', () => ({
  socketManager: { instance: mockSocket },
}));

vi.mock('@/store/session-invites.store', () => ({
  useSessionInviteStore: vi.fn(),
}));

const mockAddInvite = vi.fn();

describe('useSessionInvites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessionInviteStore).mockImplementation(
      (
        selector: (s: {
          addInvite: typeof mockAddInvite;
          pendingInvites: never[];
          dismissInvite: () => void;
        }) => unknown
      ) => selector({ addInvite: mockAddInvite, pendingInvites: [], dismissInvite: vi.fn() })
    );
  });

  it('subscribes to "session_invitation" on mount', () => {
    renderHook(() => useSessionInvites());
    expect(mockSocket.on).toHaveBeenCalledWith('session_invitation', expect.any(Function));
  });

  it('unsubscribes from "session_invitation" on unmount', () => {
    const { unmount } = renderHook(() => useSessionInvites());
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith('session_invitation', expect.any(Function));
  });

  it('calls addInvite when a session_invitation event is received', () => {
    renderHook(() => useSessionInvites());

    // Grab the handler registered with socket.on
    const [, handler] = mockSocket.on.mock.calls.find((args) => args[0] === 'session_invitation')!;

    const invite: SessionInvite = {
      sessionId: 'sess-1',
      roomId: 'room-1',
      hostId: 'user-1',
      sessionTitle: 'Team Meeting',
      sessionType: 'MEETING',
      inviteToken: 'token-abc',
    };

    handler(invite);

    expect(mockAddInvite).toHaveBeenCalledWith(invite);
  });

  it('uses the same handler reference for on/off (no listener leak on remount)', () => {
    const { unmount } = renderHook(() => useSessionInvites());
    unmount();

    // Both on and off should have been called exactly once with the same event name
    const onCall = mockSocket.on.mock.calls.find((args) => args[0] === 'session_invitation');
    const offCall = mockSocket.off.mock.calls.find((args) => args[0] === 'session_invitation');

    expect(onCall).toBeDefined();
    expect(offCall).toBeDefined();
    // The handler registered must be the same function that is removed
    expect(onCall![1]).toBe(offCall![1]);
  });
});
