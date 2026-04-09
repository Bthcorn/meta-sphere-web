import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messagesApi } from '../messages.api';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);

const mockMessage = {
  id: 'msg-1',
  content: 'Hello world',
  type: 'TEXT' as const,
  isDeleted: false,
  isEdited: false,
  reactions: {},
  createdAt: '2024-01-01T00:00:00Z',
  roomId: 'room-1',
  sessionId: null,
  receiverId: null,
  sender: { id: 'user-1', username: 'alice' },
};

describe('messagesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoomMessages', () => {
    it('GETs /api/messages/room/:roomId with default limit 50', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockMessage] });

      const result = await messagesApi.getRoomMessages('room-1');

      expect(mockGet).toHaveBeenCalledWith('/api/messages/room/room-1', { params: { limit: 50 } });
      expect(result).toEqual([mockMessage]);
    });

    it('passes a custom limit when provided', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await messagesApi.getRoomMessages('room-1', 100);

      expect(mockGet).toHaveBeenCalledWith('/api/messages/room/room-1', { params: { limit: 100 } });
    });

    it('returns an empty array when no messages exist', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await messagesApi.getRoomMessages('room-empty');

      expect(result).toEqual([]);
    });
  });

  describe('getSessionMessages', () => {
    it('GETs /api/messages/session/:sessionId with default limit 100', async () => {
      const sessionMsg = { ...mockMessage, roomId: null, sessionId: 'sess-1' };
      mockGet.mockResolvedValueOnce({ data: [sessionMsg] });

      const result = await messagesApi.getSessionMessages('sess-1');

      expect(mockGet).toHaveBeenCalledWith('/api/messages/session/sess-1', {
        params: { limit: 100 },
      });
      expect(result).toEqual([sessionMsg]);
    });

    it('passes a custom limit when provided', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await messagesApi.getSessionMessages('sess-1', 25);

      expect(mockGet).toHaveBeenCalledWith('/api/messages/session/sess-1', {
        params: { limit: 25 },
      });
    });
  });
});
