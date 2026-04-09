import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOnlineFriends } from '../useOnlineFriends';
import { friendsApi } from '@/api/friends';
import type { FriendEntry } from '@/types/friend';

vi.mock('@/api/friends', () => ({
  friendsApi: {
    getOnline: vi.fn(),
  },
}));

const mockGetOnline = vi.mocked(friendsApi.getOnline);

function makeEntry(id: string): FriendEntry {
  return {
    friendshipId: `friendship-${id}`,
    since: '2024-01-01T00:00:00Z',
    friend: { id, username: `user-${id}` },
  };
}

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { Wrapper };
}

describe('useOnlineFriends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped UserSummary objects for online friends', async () => {
    const { Wrapper } = createWrapper();
    mockGetOnline.mockResolvedValueOnce([makeEntry('1'), makeEntry('2')]);

    const { result } = renderHook(() => useOnlineFriends(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.onlineFriends).toEqual([
      { id: '1', username: 'user-1' },
      { id: '2', username: 'user-2' },
    ]);
  });

  it('returns an empty array when no friends are online', async () => {
    const { Wrapper } = createWrapper();
    mockGetOnline.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOnlineFriends(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.onlineFriends).toEqual([]);
  });

  it('returns isLoading=true while the request is in flight', () => {
    const { Wrapper } = createWrapper();
    mockGetOnline.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useOnlineFriends(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('calls friendsApi.getOnline', async () => {
    const { Wrapper } = createWrapper();
    mockGetOnline.mockResolvedValueOnce([makeEntry('3')]);

    renderHook(() => useOnlineFriends(), { wrapper: Wrapper });

    await waitFor(() => expect(mockGetOnline).toHaveBeenCalledOnce());
  });
});
