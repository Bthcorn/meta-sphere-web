import { api } from '@/lib/api';
import type {
  FileEntity,
  DownloadUrlResponse,
  UploadLibraryFileDto,
  UploadSessionFileDto,
  ListFilesFilter,
} from '@/types/file';

const PREFIX = '/api/files';

export const filesApi = {
  // ── Library ────────────────────────────────────────────────────────────────

  /**
   * Upload a file to the library room.
   * @param onProgress  Callback receiving 0–100 progress value.
   */
  uploadLibraryFile: (
    file: File,
    dto: UploadLibraryFileDto,
    onProgress?: (progress: number) => void
  ): Promise<FileEntity> => {
    const form = new FormData();
    form.append('file', file);
    form.append('roomId', dto.roomId);
    if (dto.description) form.append('description', dto.description);
    if (dto.category) form.append('category', dto.category);
    if (dto.subject) form.append('subject', dto.subject);
    if (dto.yearLevel != null) form.append('yearLevel', String(dto.yearLevel));
    if (dto.isPublic != null) form.append('isPublic', String(dto.isPublic));
    if (dto.tags?.length) {
      // Backend expects repeated form fields OR a JSON array — send as multiple fields
      dto.tags.forEach((tag) => form.append('tags', tag));
    }

    return api
      .post<FileEntity>(`${PREFIX}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  listRoomFiles: (roomId: string, filters: ListFilesFilter = {}): Promise<FileEntity[]> =>
    api.get<FileEntity[]>(`${PREFIX}/room/${roomId}`, { params: filters }).then((r) => r.data),

  // ── Session tray ───────────────────────────────────────────────────────────

  /**
   * Upload a file to the session tray (no metadata form — just sessionId).
   */
  uploadSessionFile: (
    file: File,
    dto: UploadSessionFileDto,
    onProgress?: (progress: number) => void
  ): Promise<FileEntity> => {
    const form = new FormData();
    form.append('file', file);
    form.append('sessionId', dto.sessionId);

    return api
      .post<FileEntity>(`${PREFIX}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  listSessionFiles: (sessionId: string): Promise<FileEntity[]> =>
    api.get<FileEntity[]>(`${PREFIX}/session/${sessionId}`).then((r) => r.data),

  // ── Shared ─────────────────────────────────────────────────────────────────

  getFile: (fileId: string): Promise<FileEntity> =>
    api.get<FileEntity>(`${PREFIX}/${fileId}`).then((r) => r.data),

  getDownloadUrl: (fileId: string): Promise<DownloadUrlResponse> =>
    api.get<DownloadUrlResponse>(`${PREFIX}/${fileId}/download-url`).then((r) => r.data),

  deleteFile: (fileId: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`${PREFIX}/${fileId}`).then((r) => r.data),

  updateMetadata: (
    fileId: string,
    dto: Partial<{
      description: string;
      category: string;
      tags: string[];
      subject: string;
      yearLevel: number;
      isPublic: boolean;
    }>
  ): Promise<FileEntity> => api.patch<FileEntity>(`${PREFIX}/${fileId}`, dto).then((r) => r.data),
};
