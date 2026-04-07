import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFriendRequestsRealtimeSync } from '../useFriendRequestsRealtimeSync';

const { mockSocket, getMockIsConnected, setMockIsConnected } = vi.hoisted(() => {
  let isConnected = false;
  return {
    mockSocket: { on: vi.fn(), off: vi.fn() },
    getMockIsConnected: () => isConnected,
    setMockIsConnected: (v: boolean) => {
      isConnected = v;
    },
  };
});

vi.mock('@/lib/socket-manager', () => ({
  socketManager: { instance: mockSocket },
}));

vi.mock('@/store/socket.store', () => ({
  useSocketStore: vi.fn((selector: (s: { isConnected: boolean }) => unknown) =>
    selector({ isConnected: getMockIsConnected() })
  ),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  vi.spyOn(qc, 'invalidateQueries');
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { qc, Wrapper };
}

describe('useFriendRequestsRealtimeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockIsConnected(false);
  });

  it('does not subscribe when socket is not connected', () => {
    setMockIsConnected(false);
    const { Wrapper } = createWrapper();

    renderHook(() => useFriendRequestsRealtimeSync(), { wrapper: Wrapper });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  it('subscribes to friend_requests:updated when connected', () => {
    setMockIsConnected(true);
    const { Wrapper } = createWrapper();

    renderHook(() => useFriendRequestsRealtimeSync(), { wrapper: Wrapper });

    expect(mockSocket.on).toHaveBeenCalledWith('friend_requests:updated', expect.any(Function));
  });

  it('invalidates all friend queries when event fires', () => {
    setMockIsConnected(true);
    const { qc, Wrapper } = createWrapper();

    renderHook(() => useFriendRequestsRealtimeSync(), { wrapper: Wrapper });

    const handler = vi.mocked(mockSocket.on).mock.calls[0][1] as () => void;
    handler();

    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['friends'] });
  });

  it('unsubscribes from the event on unmount', () => {
    setMockIsConnected(true);
    const { Wrapper } = createWrapper();

    const { unmount } = renderHook(() => useFriendRequestsRealtimeSync(), { wrapper: Wrapper });

    const registeredHandler = vi.mocked(mockSocket.on).mock.calls[0][1];
    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('friend_requests:updated', registeredHandler);
  });

  it('unsubscribes and resubscribes when connection is restored', () => {
    setMockIsConnected(true);
    const { Wrapper } = createWrapper();

    const { rerender } = renderHook(() => useFriendRequestsRealtimeSync(), { wrapper: Wrapper });

    expect(mockSocket.on).toHaveBeenCalledTimes(1);

    setMockIsConnected(false);
    rerender();

    expect(mockSocket.off).toHaveBeenCalledTimes(1);

    setMockIsConnected(true);
    rerender();

    expect(mockSocket.on).toHaveBeenCalledTimes(2);
  });
});
