import { describe, it, expect, vi, beforeEach } from 'vitest';
import { friendsApi } from '../friends';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);
const mockDelete = vi.mocked(api.delete);

const mockFriend = {
  friendshipId: 'friendship-1',
  since: '2024-01-01T00:00:00Z',
  friend: { id: 'user-2', username: 'alice' },
};

const mockRequest = {
  id: 'req-1',
  status: 'PENDING' as const,
  requesterId: 'user-1',
  addresseeId: 'user-2',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  requester: { id: 'user-1', username: 'bob' },
  addressee: { id: 'user-2', username: 'alice' },
};

describe('friendsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('calls GET /api/friends and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockFriend] });

      const result = await friendsApi.getAll();

      expect(mockGet).toHaveBeenCalledWith('/api/friends');
      expect(result).toEqual([mockFriend]);
    });
  });

  describe('getOnline', () => {
    it('calls GET /api/friends/online and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockFriend] });

      const result = await friendsApi.getOnline();

      expect(mockGet).toHaveBeenCalledWith('/api/friends/online');
      expect(result).toEqual([mockFriend]);
    });
  });

  describe('getPendingRequests', () => {
    it('calls GET /api/friends/requests and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockRequest] });

      const result = await friendsApi.getPendingRequests();

      expect(mockGet).toHaveBeenCalledWith('/api/friends/requests');
      expect(result).toEqual([mockRequest]);
    });
  });

  describe('sendRequest', () => {
    it('calls POST /api/friends/request/:userId and returns data', async () => {
      mockPost.mockResolvedValueOnce({ data: mockRequest });

      const result = await friendsApi.sendRequest('user-2');

      expect(mockPost).toHaveBeenCalledWith('/api/friends/request/user-2');
      expect(result).toEqual(mockRequest);
    });
  });

  describe('accept', () => {
    it('calls POST /api/friends/accept/:requestId and returns data', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Accepted' } });

      const result = await friendsApi.accept('req-1');

      expect(mockPost).toHaveBeenCalledWith('/api/friends/accept/req-1');
      expect(result).toEqual({ message: 'Accepted' });
    });
  });

  describe('decline', () => {
    it('calls POST /api/friends/decline/:requestId and returns data', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Declined' } });

      const result = await friendsApi.decline('req-1');

      expect(mockPost).toHaveBeenCalledWith('/api/friends/decline/req-1');
      expect(result).toEqual({ message: 'Declined' });
    });
  });

  describe('remove', () => {
    it('calls DELETE /api/friends/:userId and returns data', async () => {
      mockDelete.mockResolvedValueOnce({ data: { message: 'Removed' } });

      const result = await friendsApi.remove('user-2');

      expect(mockDelete).toHaveBeenCalledWith('/api/friends/user-2');
      expect(result).toEqual({ message: 'Removed' });
    });
  });
});
