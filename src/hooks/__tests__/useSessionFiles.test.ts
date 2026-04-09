import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessionFiles } from '../useSessionFiles';
import { filesApi } from '@/api/files.api';
import { useSessionFilesStore } from '@/store/session-files.store';

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockSocket, mockSocketEmit } = vi.hoisted(() => ({
  mockSocket: { on: vi.fn(), off: vi.fn() },
  mockSocketEmit: vi.fn(),
}));

vi.mock('@/lib/socket-manager', () => ({
  socketManager: {
    instance: mockSocket,
    emit: mockSocketEmit,
  },
}));

vi.mock('@/store/socket.store', () => ({
  useSocketStore: vi.fn((sel: (s: { isConnected: boolean }) => unknown) =>
    sel({ isConnected: true })
  ),
}));

vi.mock('@/api/files.api', () => ({
  filesApi: {
    listSessionFiles: vi.fn(),
    uploadSessionFile: vi.fn(),
  },
}));

const mockListSessionFiles = vi.mocked(filesApi.listSessionFiles);
const mockUploadSessionFile = vi.mocked(filesApi.uploadSessionFile);

function makeFile(id = 'file-1') {
  return {
    id,
    name: `file-${id}.pdf`,
    description: null,
    storageKey: `uploads/${id}.pdf`,
    mimeType: 'application/pdf',
    size: 1024,
    category: 'MISC' as const,
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
  };
}

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { Wrapper };
}

describe('useSessionFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionFilesStore.setState({
      filesBySession: {},
      unreadBySession: {},
      trayOpen: false,
      uploadProgress: 0,
    });
    mockListSessionFiles.mockResolvedValue([]);
  });

  // ── Initial load ───────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('fetches files for the session on mount', async () => {
      mockListSessionFiles.mockResolvedValueOnce([makeFile('f1')]);
      const { Wrapper } = createWrapper();

      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      await waitFor(() => expect(mockListSessionFiles).toHaveBeenCalledWith('sess-1'));
    });

    it('stores the loaded files in the session-files store', async () => {
      const files = [makeFile('f1'), makeFile('f2')];
      mockListSessionFiles.mockResolvedValueOnce(files);
      const { Wrapper } = createWrapper();

      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      await waitFor(() =>
        expect(useSessionFilesStore.getState().filesBySession['sess-1']).toEqual(files)
      );
    });
  });

  // ── Socket listeners ───────────────────────────────────────────────────────

  describe('socket listeners', () => {
    it('subscribes to session:file_shared, session:file_removed, session:tray_cleared', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      const events = mockSocket.on.mock.calls.map((args) => args[0] as string);
      expect(events).toContain('session:file_shared');
      expect(events).toContain('session:file_removed');
      expect(events).toContain('session:tray_cleared');
    });

    it('unsubscribes on unmount', () => {
      const { Wrapper } = createWrapper();
      const { unmount } = renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });
      unmount();

      const events = mockSocket.off.mock.calls.map((args) => args[0] as string);
      expect(events).toContain('session:file_shared');
      expect(events).toContain('session:file_removed');
      expect(events).toContain('session:tray_cleared');
    });

    it('adds a file to the store when session:file_shared fires', () => {
      const { Wrapper } = createWrapper();
      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        (args) => args[0] === 'session:file_shared'
      )![1] as (f: ReturnType<typeof makeFile>) => void;

      act(() => handler(makeFile('f-new')));

      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toContainEqual(
        expect.objectContaining({ id: 'f-new' })
      );
    });

    it('removes a file from the store when session:file_removed fires', () => {
      useSessionFilesStore.setState({ filesBySession: { 'sess-1': [makeFile('f1')] } });
      const { Wrapper } = createWrapper();
      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        (args) => args[0] === 'session:file_removed'
      )![1] as (payload: { fileId: string }) => void;

      act(() => handler({ fileId: 'f1' }));

      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toHaveLength(0);
    });

    it('clears the session when session:tray_cleared fires with matching sessionId', () => {
      useSessionFilesStore.setState({ filesBySession: { 'sess-1': [makeFile()] } });
      const { Wrapper } = createWrapper();
      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        (args) => args[0] === 'session:tray_cleared'
      )![1] as (payload: { sessionId: string }) => void;

      act(() => handler({ sessionId: 'sess-1' }));

      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toBeUndefined();
    });

    it('ignores session:tray_cleared for a different sessionId', () => {
      useSessionFilesStore.setState({ filesBySession: { 'sess-1': [makeFile()] } });
      const { Wrapper } = createWrapper();
      renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      const handler = mockSocket.on.mock.calls.find(
        (args) => args[0] === 'session:tray_cleared'
      )![1] as (payload: { sessionId: string }) => void;

      act(() => handler({ sessionId: 'sess-OTHER' }));

      expect(useSessionFilesStore.getState().filesBySession['sess-1']).toBeDefined();
    });
  });

  // ── uploadFile ─────────────────────────────────────────────────────────────

  describe('uploadFile', () => {
    it('calls filesApi.uploadSessionFile with the file and sessionId', async () => {
      const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
      mockUploadSessionFile.mockResolvedValueOnce(makeFile('uploaded'));
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      await act(async () => result.current.uploadFile(file));

      await waitFor(() =>
        expect(mockUploadSessionFile).toHaveBeenCalledWith(
          file,
          { sessionId: 'sess-1' },
          expect.any(Function)
        )
      );
    });

    it('emits session:file_share socket event on successful upload', async () => {
      const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
      mockUploadSessionFile.mockResolvedValueOnce(makeFile('uploaded'));
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      await act(async () => result.current.uploadFile(file));

      await waitFor(() =>
        expect(mockSocketEmit).toHaveBeenCalledWith('session:file_share', {
          fileId: 'uploaded',
          sessionId: 'sess-1',
        })
      );
    });

    it('reflects isUploading:true while the mutation is pending', async () => {
      let resolveUpload!: (v: ReturnType<typeof makeFile>) => void;
      mockUploadSessionFile.mockReturnValueOnce(
        new Promise((res) => {
          resolveUpload = res;
        })
      );
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      act(() => result.current.uploadFile(new File(['x'], 'x.pdf')));

      await waitFor(() => expect(result.current.isUploading).toBe(true));

      // Cleanup
      act(() => resolveUpload(makeFile('done')));
    });
  });

  // ── removeFile ─────────────────────────────────────────────────────────────

  describe('removeFile', () => {
    it('emits session:file_remove via socket', async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSessionFiles('sess-1'), { wrapper: Wrapper });

      await act(async () => result.current.removeFile('file-99'));

      expect(mockSocketEmit).toHaveBeenCalledWith('session:file_remove', {
        fileId: 'file-99',
        sessionId: 'sess-1',
      });
    });
  });
});
