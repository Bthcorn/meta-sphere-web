import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionsApi } from '../sessions.api';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);
const mockPatch = vi.mocked(api.patch);
const mockDelete = vi.mocked(api.delete);

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

describe('sessionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('calls GET /api/sessions and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockSession] });

      const result = await sessionsApi.list();

      expect(mockGet).toHaveBeenCalledWith('/api/sessions', { params: undefined });
      expect(result).toEqual([mockSession]);
    });

    it('passes roomId and status params when provided', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await sessionsApi.list({ roomId: 'room-1', status: 'ACTIVE' });

      expect(mockGet).toHaveBeenCalledWith('/api/sessions', {
        params: { roomId: 'room-1', status: 'ACTIVE' },
      });
    });
  });

  describe('get', () => {
    it('calls GET /api/sessions/:id and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: mockSession });

      const result = await sessionsApi.get('session-1');

      expect(mockGet).toHaveBeenCalledWith('/api/sessions/session-1');
      expect(result).toEqual(mockSession);
    });
  });

  describe('create', () => {
    it('calls POST /api/sessions and returns data', async () => {
      const dto = { roomId: 'room-1', title: 'Team Standup', type: 'MEETING' as const };
      mockPost.mockResolvedValueOnce({ data: mockSession });

      const result = await sessionsApi.create(dto);

      expect(mockPost).toHaveBeenCalledWith('/api/sessions', dto);
      expect(result).toEqual(mockSession);
    });
  });

  describe('update', () => {
    it('calls PATCH /api/sessions/:id and returns data', async () => {
      const updated = { ...mockSession, title: 'Updated Title' };
      mockPatch.mockResolvedValueOnce({ data: updated });

      const result = await sessionsApi.update('session-1', { title: 'Updated Title' });

      expect(mockPatch).toHaveBeenCalledWith('/api/sessions/session-1', { title: 'Updated Title' });
      expect(result).toEqual(updated);
    });
  });

  describe('start', () => {
    it('calls POST /api/sessions/:id/start and returns data', async () => {
      const started = { ...mockSession, status: 'ACTIVE' as const };
      mockPost.mockResolvedValueOnce({ data: started });

      const result = await sessionsApi.start('session-1');

      expect(mockPost).toHaveBeenCalledWith('/api/sessions/session-1/start');
      expect(result).toEqual(started);
    });
  });

  describe('end', () => {
    it('calls POST /api/sessions/:id/end and returns data', async () => {
      const ended = { ...mockSession, status: 'ENDED' as const };
      mockPost.mockResolvedValueOnce({ data: ended });

      const result = await sessionsApi.end('session-1');

      expect(mockPost).toHaveBeenCalledWith('/api/sessions/session-1/end');
      expect(result).toEqual(ended);
    });
  });

  describe('join', () => {
    it('calls POST /api/sessions/:id/join without password', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Joined' } });

      const result = await sessionsApi.join('session-1');

      expect(mockPost).toHaveBeenCalledWith('/api/sessions/session-1/join', {
        password: undefined,
      });
      expect(result).toEqual({ message: 'Joined' });
    });

    it('calls POST /api/sessions/:id/join with password when provided', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Joined' } });

      await sessionsApi.join('session-1', 'secret123');

      expect(mockPost).toHaveBeenCalledWith('/api/sessions/session-1/join', {
        password: 'secret123',
      });
    });
  });

  describe('leave', () => {
    it('calls POST /api/sessions/:id/leave and returns data', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Left' } });

      const result = await sessionsApi.leave('session-1');

      expect(mockPost).toHaveBeenCalledWith('/api/sessions/session-1/leave');
      expect(result).toEqual({ message: 'Left' });
    });
  });

  describe('getParticipants', () => {
    it('calls GET /api/sessions/:id/participants and returns data', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockParticipant] });

      const result = await sessionsApi.getParticipants('session-1');

      expect(mockGet).toHaveBeenCalledWith('/api/sessions/session-1/participants');
      expect(result).toEqual([mockParticipant]);
    });
  });

  describe('kick', () => {
    it('calls DELETE /api/sessions/:id/participants/:userId and returns data', async () => {
      mockDelete.mockResolvedValueOnce({ data: { message: 'Kicked' } });

      const result = await sessionsApi.kick('session-1', 'user-2');

      expect(mockDelete).toHaveBeenCalledWith('/api/sessions/session-1/participants/user-2');
      expect(result).toEqual({ message: 'Kicked' });
    });
  });
});
