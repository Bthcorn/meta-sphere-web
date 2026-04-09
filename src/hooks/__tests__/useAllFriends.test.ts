import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAllFriends } from '../useAllFriends';
import { friendsApi } from '@/api/friends';
import type { FriendEntry } from '@/types/friend';

vi.mock('@/api/friends', () => ({
  friendsApi: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(friendsApi.getAll);

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

describe('useAllFriends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped friend UserSummary objects', async () => {
    const { Wrapper } = createWrapper();
    mockGetAll.mockResolvedValueOnce([makeEntry('1'), makeEntry('2')]);

    const { result } = renderHook(() => useAllFriends(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.friends).toEqual([
      { id: '1', username: 'user-1' },
      { id: '2', username: 'user-2' },
    ]);
  });

  it('returns an empty array while loading', () => {
    const { Wrapper } = createWrapper();
    mockGetAll.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAllFriends(), { wrapper: Wrapper });

    // Before the query resolves
    expect(result.current.friends).toEqual([]);
  });

  it('returns isLoading=true while the request is in flight', () => {
    const { Wrapper } = createWrapper();
    mockGetAll.mockReturnValueOnce(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useAllFriends(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('calls friendsApi.getAll', async () => {
    const { Wrapper } = createWrapper();
    mockGetAll.mockResolvedValueOnce([makeEntry('1')]);

    renderHook(() => useAllFriends(), { wrapper: Wrapper });

    await waitFor(() => expect(mockGetAll).toHaveBeenCalledOnce());
  });
});
