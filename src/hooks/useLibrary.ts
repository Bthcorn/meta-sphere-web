import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/api/files.api';
import { useLibraryStore } from '@/store/library.store';
import type { UploadLibraryFileDto } from '@/types/file';

const QUERY_KEY = (roomId: string) => ['files', 'library', roomId] as const;

export function useLibraryFiles(roomId: string) {
  const filters = useLibraryStore((s) => s.filters);

  return useQuery({
    queryKey: [...QUERY_KEY(roomId), filters],
    queryFn: () => filesApi.listRoomFiles(roomId, filters),
    staleTime: 30_000,
    enabled: !!roomId,
  });
}

export function useUploadLibraryFile(roomId: string) {
  const qc = useQueryClient();
  const { setUploadProgress, resetUploadProgress, closeUploadModal } = useLibraryStore();

  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: Omit<UploadLibraryFileDto, 'roomId'> }) =>
      filesApi.uploadLibraryFile(file, { ...dto, roomId }, (p) => setUploadProgress(p)),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY(roomId) });
      resetUploadProgress();
      closeUploadModal();
    },

    onError: () => {
      resetUploadProgress();
    },
  });
}

export function useDeleteLibraryFile(roomId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY(roomId) });
    },
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (fileId: string) => filesApi.getDownloadUrl(fileId),
    onSuccess: ({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  });
}
