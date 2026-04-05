import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFriendRequests } from '../useFriendRequests';
import { friendsApi } from '@/api/friends';
import type { PendingFriendRequest } from '@/types/friend';

vi.mock('@/api/friends', () => ({
  friendsApi: {
    getPendingRequests: vi.fn(),
    sendRequest: vi.fn(),
    accept: vi.fn(),
    decline: vi.fn(),
  },
}));

const mockApi = vi.mocked(friendsApi);

const mockRequest = (
  id: string,
  requesterId = 'user-1',
  addresseeId = 'user-2'
): PendingFriendRequest => ({
  id,
  status: 'PENDING',
  requesterId,
  addresseeId,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  requester: { id: requesterId, username: 'bob' },
  addressee: { id: addresseeId, username: 'alice' },
});

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  vi.spyOn(qc, 'invalidateQueries');
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { qc, Wrapper };
}

describe('useFriendRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pendingRequests query', () => {
    it('returns pending requests from the API', async () => {
      const { Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockResolvedValue([mockRequest('req-1')]);

      const { result } = renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.pendingRequests).toEqual([mockRequest('req-1')]);
    });

    it('defaults to empty array while loading', () => {
      const { Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      expect(result.current.pendingRequests).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('invalidates friends list when pending requests change on refetch', async () => {
      const { qc, Wrapper } = createWrapper();
      mockApi.getPendingRequests
        .mockResolvedValueOnce([mockRequest('req-1')])
        .mockResolvedValueOnce([mockRequest('req-1'), mockRequest('req-2')]);

      renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(mockApi.getPendingRequests).toHaveBeenCalledTimes(1));

      await act(async () => {
        await qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
      });

      await waitFor(() => expect(mockApi.getPendingRequests).toHaveBeenCalledTimes(2));

      expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['friends', 'all'] });
    });

    it('does not invalidate friends list when requests are unchanged on refetch', async () => {
      const { qc, Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockResolvedValue([mockRequest('req-1')]);

      renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(mockApi.getPendingRequests).toHaveBeenCalledTimes(1));

      vi.mocked(qc.invalidateQueries).mockClear();

      await act(async () => {
        await qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
      });

      await waitFor(() => expect(mockApi.getPendingRequests).toHaveBeenCalledTimes(2));

      expect(qc.invalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['friends', 'all'] });
    });
  });

  describe('sendRequest mutation', () => {
    it('calls friendsApi.sendRequest and invalidates requests query', async () => {
      const { qc, Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockResolvedValue([]);
      mockApi.sendRequest.mockResolvedValue({ message: 'Sent' });

      const { result } = renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      vi.mocked(qc.invalidateQueries).mockClear();

      await act(async () => {
        await result.current.sendRequest.mutateAsync('user-2');
      });

      expect(mockApi.sendRequest).toHaveBeenCalledWith('user-2');
      expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['friends', 'requests'] });
    });
  });

  describe('accept mutation', () => {
    it('calls friendsApi.accept and invalidates all friend queries', async () => {
      const { qc, Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockResolvedValue([mockRequest('req-1')]);
      mockApi.accept.mockResolvedValue({ message: 'Accepted' });

      const { result } = renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      vi.mocked(qc.invalidateQueries).mockClear();

      await act(async () => {
        await result.current.accept.mutateAsync('req-1');
      });

      expect(mockApi.accept).toHaveBeenCalledWith('req-1');
      expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['friends'] });
    });
  });

  describe('decline mutation', () => {
    it('calls friendsApi.decline and invalidates requests query', async () => {
      const { qc, Wrapper } = createWrapper();
      mockApi.getPendingRequests.mockResolvedValue([mockRequest('req-1')]);
      mockApi.decline.mockResolvedValue({ message: 'Declined' });

      const { result } = renderHook(() => useFriendRequests(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      vi.mocked(qc.invalidateQueries).mockClear();

      await act(async () => {
        await result.current.decline.mutateAsync('req-1');
      });

      expect(mockApi.decline).toHaveBeenCalledWith('req-1');
      expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['friends', 'requests'] });
    });
  });
});
