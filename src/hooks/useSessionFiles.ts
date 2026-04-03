import { useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { filesApi } from '@/api/files.api';
import { useSessionFilesStore } from '@/store/session-files.store';
import { useSocketStore } from '@/store/socket.store';
import { socketManager } from '@/lib/socket-manager';
import type { FileEntity } from '@/types/file';

// Stable reference so the Zustand selector never returns a new array when the
// session key doesn't exist yet — prevents useSyncExternalStore infinite loop.
const EMPTY_FILES: FileEntity[] = [];

export function useSessionFiles(sessionId: string) {
  const { setFiles, addFile, removeFile, clearSession, setUploadProgress, resetUploadProgress } =
    useSessionFilesStore();
  const isConnected = useSocketStore((s) => s.isConnected);

  // ── Initial load ───────────────────────────────────────────────────────────
  useQuery({
    queryKey: ['files', 'session', sessionId],
    queryFn: async () => {
      const files = await filesApi.listSessionFiles(sessionId);
      setFiles(sessionId, files);
      return files;
    },
    staleTime: 60_000,
    enabled: !!sessionId,
  });

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected || !sessionId) return;
    const socket = socketManager.instance;
    if (!socket) return;

    const onFileShared = (file: FileEntity) => {
      addFile(sessionId, file);
    };

    const onFileRemoved = ({ fileId }: { fileId: string }) => {
      removeFile(sessionId, fileId);
    };

    const onTrayCleared = ({ sessionId: sid }: { sessionId: string }) => {
      if (sid === sessionId) clearSession(sessionId);
    };

    socket.on('session:file_shared', onFileShared);
    socket.on('session:file_removed', onFileRemoved);
    socket.on('session:tray_cleared', onTrayCleared);

    return () => {
      socket.off('session:file_shared', onFileShared);
      socket.off('session:file_removed', onFileRemoved);
      socket.off('session:tray_cleared', onTrayCleared);
    };
  }, [isConnected, sessionId, addFile, removeFile, clearSession]);

  // ── Upload mutation ────────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      filesApi.uploadSessionFile(file, { sessionId }, (p) => setUploadProgress(p)),

    onSuccess: (uploadedFile) => {
      // Optimistically add to store immediately
      addFile(sessionId, uploadedFile);
      resetUploadProgress();
      // Broadcast to other participants via WebSocket
      socketManager.emit('session:file_share', {
        fileId: uploadedFile.id,
        sessionId,
      });
    },

    onError: () => {
      resetUploadProgress();
    },
  });

  // ── Remove mutation (host only) ────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (fileId: string) => {
      // Emit WS event — backend validates host role and broadcasts removal
      socketManager.emit('session:file_remove', { fileId, sessionId });
      return Promise.resolve();
    },
  });

  const uploadFile = useCallback((file: File) => uploadMutation.mutate(file), [uploadMutation]);

  const removeFile_ = useCallback(
    (fileId: string) => removeMutation.mutate(fileId),
    [removeMutation]
  );

  const files = useSessionFilesStore((s) => s.filesBySession[sessionId] ?? EMPTY_FILES);

  return {
    files,
    uploadFile,
    removeFile: removeFile_,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
}
