export type FileCategory =
  | 'LECTURE_NOTES'
  | 'PAST_EXAMS'
  | 'ASSIGNMENTS'
  | 'SOLUTIONS'
  | 'CHEAT_SHEETS'
  | 'TUTORIAL'
  | 'RESOURCE'
  | 'MISC';

export interface FileUploader {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarPreset?: string;
}

export interface FileEntity {
  id: string;
  name: string;
  description: string | null;
  storageKey: string;
  mimeType: string;
  size: number; // BigInt serialised as number by the API
  category: FileCategory;
  tags: string[];
  subject: string | null;
  yearLevel: number | null;
  isPublic: boolean;
  downloadCount: number;
  roomId: string | null;
  sessionId: string | null;
  uploadedById: string;
  uploadedBy: FileUploader;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadUrlResponse {
  url: string;
  expiresInSeconds: number;
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadLibraryFileDto {
  roomId: string;
  description?: string;
  category?: FileCategory;
  tags?: string[];
  subject?: string;
  yearLevel?: number;
  isPublic?: boolean;
}

export interface UploadSessionFileDto {
  sessionId: string;
}

// ── Query filters ─────────────────────────────────────────────────────────────

export interface ListFilesFilter {
  category?: FileCategory;
  tag?: string;
  subject?: string;
  yearLevel?: number;
  search?: string;
  sortBy?: 'createdAt' | 'downloadCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}
