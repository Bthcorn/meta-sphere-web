import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionFilesStore } from '../session-files.store';
import type { FileEntity } from '@/types/file';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
  return {
    id: 'file-1',
    name: 'notes.pdf',
    description: null,
    storageKey: 'uploads/notes.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    category: 'MISC',
    tags: [],
    subject: null,
    yearLevel: null,
    isPublic: false,
    downloadCount: 0,
    roomId: null,
    sessionId: 'sess-1',
    uploadedById: 'user-1',
    uploadedBy: { id: 'user-1', username: 'alice', firstName: 'Alice', lastName: 'A' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useSessionFilesStore', () => {
  beforeEach(() => {
    useSessionFilesStore.setState({
      filesBySession: {},
      unreadBySession: {},
      trayOpen: false,
      uploadProgress: 0,
    });
  });

  // ── setFiles ───────────────────────────────────────────────────────────────

  describe('setFiles', () => {
    it('stores a list of files for a session', () => {
      const files = [makeFile({ id: 'f1' }), makeFile({ id: 'f2' })];
      useSessionFilesStore.getState().setFiles('sess-1', files);
      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toEqual(files);
    });

    it('replaces the existing list for the same session', () => {
      useSessionFilesStore.getState().setFiles('sess-1', [makeFile({ id: 'f1' })]);
      useSessionFilesStore.getState().setFiles('sess-1', [makeFile({ id: 'f2' })]);
      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toHaveLength(1);
      expect(useSessionFilesStore.getState().filesBySession['sess-1'][0].id).toBe('f2');
    });
  });

  // ── addFile ────────────────────────────────────────────────────────────────

  describe('addFile', () => {
    it('appends a file to the session list', () => {
      useSessionFilesStore.getState().addFile('sess-1', makeFile());
      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toHaveLength(1);
    });

    it('deduplicates — does not add the same file twice', () => {
      const file = makeFile();
      useSessionFilesStore.getState().addFile('sess-1', file);
      useSessionFilesStore.getState().addFile('sess-1', file);
      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toHaveLength(1);
    });

    it('marks the session as unread when the tray is closed', () => {
      useSessionFilesStore.setState({ trayOpen: false });
      useSessionFilesStore.getState().addFile('sess-1', makeFile());
      expect(useSessionFilesStore.getState().unreadBySession['sess-1']).toBe(true);
    });

    it('does NOT mark unread when the tray is open', () => {
      useSessionFilesStore.setState({ trayOpen: true });
      useSessionFilesStore.getState().addFile('sess-1', makeFile());
      expect(useSessionFilesStore.getState().unreadBySession['sess-1']).toBeUndefined();
    });
  });

  // ── removeFile ─────────────────────────────────────────────────────────────

  describe('removeFile', () => {
    it('removes a file by id from the session', () => {
      useSessionFilesStore
        .getState()
        .setFiles('sess-1', [makeFile({ id: 'f1' }), makeFile({ id: 'f2' })]);
      useSessionFilesStore.getState().removeFile('sess-1', 'f1');
      const files = useSessionFilesStore.getState().filesBySession['sess-1'];
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('f2');
    });

    it('is a no-op when the fileId does not exist', () => {
      useSessionFilesStore.getState().setFiles('sess-1', [makeFile({ id: 'f1' })]);
      useSessionFilesStore.getState().removeFile('sess-1', 'non-existent');
      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toHaveLength(1);
    });
  });

  // ── clearSession ───────────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('removes files and unread badge for the session', () => {
      useSessionFilesStore.getState().setFiles('sess-1', [makeFile()]);
      useSessionFilesStore.getState().addFile('sess-1', makeFile({ id: 'f2' }));
      useSessionFilesStore.getState().clearSession('sess-1');

      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toBeUndefined();
      expect(useSessionFilesStore.getState().unreadBySession['sess-1']).toBeUndefined();
    });

    it('does not affect other sessions', () => {
      useSessionFilesStore.getState().setFiles('sess-1', [makeFile()]);
      useSessionFilesStore.getState().setFiles('sess-2', [makeFile({ id: 'f2' })]);
      useSessionFilesStore.getState().clearSession('sess-1');

      expect(useSessionFilesStore.getState().filesBySession['sess-2']).toBeDefined();
    });
  });

  // ── unread / markSeen ──────────────────────────────────────────────────────

  describe('markSeen', () => {
    it('sets unread to false for the session', () => {
      useSessionFilesStore.setState({ unreadBySession: { 'sess-1': true } });
      useSessionFilesStore.getState().markSeen('sess-1');
      expect(useSessionFilesStore.getState().unreadBySession['sess-1']).toBe(false);
    });
  });

  // ── tray open/close/toggle ─────────────────────────────────────────────────

  describe('tray state', () => {
    it('openTray sets trayOpen to true', () => {
      useSessionFilesStore.getState().openTray();
      expect(useSessionFilesStore.getState().trayOpen).toBe(true);
    });

    it('closeTray sets trayOpen to false', () => {
      useSessionFilesStore.getState().openTray();
      useSessionFilesStore.getState().closeTray();
      expect(useSessionFilesStore.getState().trayOpen).toBe(false);
    });

    it('toggleTray flips state each call', () => {
      expect(useSessionFilesStore.getState().trayOpen).toBe(false);
      useSessionFilesStore.getState().toggleTray();
      expect(useSessionFilesStore.getState().trayOpen).toBe(true);
      useSessionFilesStore.getState().toggleTray();
      expect(useSessionFilesStore.getState().trayOpen).toBe(false);
    });
  });

  // ── uploadProgress ─────────────────────────────────────────────────────────

  describe('upload progress', () => {
    it('setUploadProgress updates the value', () => {
      useSessionFilesStore.getState().setUploadProgress(75);
      expect(useSessionFilesStore.getState().uploadProgress).toBe(75);
    });

    it('resetUploadProgress resets to 0', () => {
      useSessionFilesStore.getState().setUploadProgress(50);
      useSessionFilesStore.getState().resetUploadProgress();
      expect(useSessionFilesStore.getState().uploadProgress).toBe(0);
    });
  });
});
