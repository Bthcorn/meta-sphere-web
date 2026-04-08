import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosProgressEvent } from 'axios';
import { filesApi } from '../files.api';
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

const mockFile: File = new File(['hello'], 'test.pdf', { type: 'application/pdf' });

const mockFileEntity = {
  id: 'file-1',
  name: 'test.pdf',
  description: null,
  storageKey: 'uploads/test.pdf',
  mimeType: 'application/pdf',
  size: 5,
  category: 'MISC' as const,
  tags: [],
  subject: null,
  yearLevel: null,
  isPublic: false,
  downloadCount: 0,
  roomId: 'room-1',
  sessionId: null,
  uploadedById: 'user-1',
  uploadedBy: { id: 'user-1', username: 'alice', firstName: 'Alice', lastName: 'A' },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('filesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── uploadLibraryFile ──────────────────────────────────────────────────────

  describe('uploadLibraryFile', () => {
    it('POSTs to /api/files/upload with FormData and returns FileEntity', async () => {
      mockPost.mockResolvedValueOnce({ data: mockFileEntity });

      const result = await filesApi.uploadLibraryFile(mockFile, { roomId: 'room-1' });

      expect(mockPost).toHaveBeenCalledOnce();
      const [url, formData, config] = mockPost.mock.calls[0];
      expect(url).toBe('/api/files/upload');
      expect(formData).toBeInstanceOf(FormData);
      expect((formData as FormData).get('roomId')).toBe('room-1');
      expect((formData as FormData).get('file')).toBe(mockFile);
      expect(config?.headers?.['Content-Type']).toBe('multipart/form-data');
      expect(result).toEqual(mockFileEntity);
    });

    it('appends optional fields when provided', async () => {
      mockPost.mockResolvedValueOnce({ data: mockFileEntity });

      await filesApi.uploadLibraryFile(mockFile, {
        roomId: 'room-1',
        description: 'desc',
        category: 'LECTURE_NOTES',
        subject: 'Math',
        yearLevel: 3,
        isPublic: true,
        tags: ['tag1', 'tag2'],
      });

      const [, formData] = mockPost.mock.calls[0];
      const fd = formData as FormData;
      expect(fd.get('description')).toBe('desc');
      expect(fd.get('category')).toBe('LECTURE_NOTES');
      expect(fd.get('subject')).toBe('Math');
      expect(fd.get('yearLevel')).toBe('3');
      expect(fd.get('isPublic')).toBe('true');
      expect(fd.getAll('tags')).toEqual(['tag1', 'tag2']);
    });

    it('calls onProgress callback with 0-100 values', async () => {
      const onProgress = vi.fn();
      mockPost.mockImplementationOnce((_url, _data, config) => {
        config?.onUploadProgress?.({ loaded: 50, total: 100, bytes: 50 } as AxiosProgressEvent);
        return Promise.resolve({ data: mockFileEntity });
      });

      await filesApi.uploadLibraryFile(mockFile, { roomId: 'room-1' }, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('does not call onProgress when total is unavailable', async () => {
      const onProgress = vi.fn();
      mockPost.mockImplementationOnce((_url, _data, config) => {
        config?.onUploadProgress?.({ loaded: 50, total: 0, bytes: 50 } as AxiosProgressEvent);
        return Promise.resolve({ data: mockFileEntity });
      });

      await filesApi.uploadLibraryFile(mockFile, { roomId: 'room-1' }, onProgress);

      expect(onProgress).not.toHaveBeenCalled();
    });
  });

  // ── listRoomFiles ──────────────────────────────────────────────────────────

  describe('listRoomFiles', () => {
    it('GETs /api/files/room/:roomId and returns array', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockFileEntity] });

      const result = await filesApi.listRoomFiles('room-1');

      expect(mockGet).toHaveBeenCalledWith('/api/files/room/room-1', { params: {} });
      expect(result).toEqual([mockFileEntity]);
    });

    it('passes filter params', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await filesApi.listRoomFiles('room-1', { category: 'PAST_EXAMS', subject: 'CS' });

      expect(mockGet).toHaveBeenCalledWith('/api/files/room/room-1', {
        params: { category: 'PAST_EXAMS', subject: 'CS' },
      });
    });
  });

  // ── uploadSessionFile ──────────────────────────────────────────────────────

  describe('uploadSessionFile', () => {
    it('POSTs with sessionId in FormData', async () => {
      mockPost.mockResolvedValueOnce({ data: mockFileEntity });

      const result = await filesApi.uploadSessionFile(mockFile, { sessionId: 'sess-1' });

      const [, formData] = mockPost.mock.calls[0];
      const fd = formData as FormData;
      expect(fd.get('sessionId')).toBe('sess-1');
      expect(fd.get('file')).toBe(mockFile);
      expect(result).toEqual(mockFileEntity);
    });
  });

  // ── listSessionFiles ───────────────────────────────────────────────────────

  describe('listSessionFiles', () => {
    it('GETs /api/files/session/:sessionId', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockFileEntity] });

      const result = await filesApi.listSessionFiles('sess-1');

      expect(mockGet).toHaveBeenCalledWith('/api/files/session/sess-1');
      expect(result).toEqual([mockFileEntity]);
    });
  });

  // ── getFile ────────────────────────────────────────────────────────────────

  describe('getFile', () => {
    it('GETs /api/files/:fileId', async () => {
      mockGet.mockResolvedValueOnce({ data: mockFileEntity });

      const result = await filesApi.getFile('file-1');

      expect(mockGet).toHaveBeenCalledWith('/api/files/file-1');
      expect(result).toEqual(mockFileEntity);
    });
  });

  // ── getDownloadUrl ─────────────────────────────────────────────────────────

  describe('getDownloadUrl', () => {
    it('GETs /api/files/:fileId/download-url', async () => {
      const mockUrl = { url: 'https://s3.example.com/file-1', expiresInSeconds: 3600 };
      mockGet.mockResolvedValueOnce({ data: mockUrl });

      const result = await filesApi.getDownloadUrl('file-1');

      expect(mockGet).toHaveBeenCalledWith('/api/files/file-1/download-url');
      expect(result).toEqual(mockUrl);
    });
  });

  // ── deleteFile ─────────────────────────────────────────────────────────────

  describe('deleteFile', () => {
    it('DELETEs /api/files/:fileId', async () => {
      mockDelete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

      const result = await filesApi.deleteFile('file-1');

      expect(mockDelete).toHaveBeenCalledWith('/api/files/file-1');
      expect(result).toEqual({ message: 'Deleted' });
    });
  });

  // ── updateMetadata ─────────────────────────────────────────────────────────

  describe('updateMetadata', () => {
    it('PATCHes /api/files/:fileId with partial dto', async () => {
      const updated = { ...mockFileEntity, description: 'new desc' };
      mockPatch.mockResolvedValueOnce({ data: updated });

      const result = await filesApi.updateMetadata('file-1', { description: 'new desc' });

      expect(mockPatch).toHaveBeenCalledWith('/api/files/file-1', { description: 'new desc' });
      expect(result).toEqual(updated);
    });
  });
});
