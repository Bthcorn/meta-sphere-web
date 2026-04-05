import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '@/api/friends';
import type { PendingFriendRequest } from '@/types/friend';

function pendingRequestsSignature(reqs: PendingFriendRequest[] | undefined): string {
  if (!reqs?.length) return '';
  return [...reqs]
    .map((r) => r.id)
    .sort()
    .join(',');
}

export function useFriendRequests() {
  const qc = useQueryClient();

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: async () => {
      const prev = qc.getQueryData<PendingFriendRequest[]>(['friends', 'requests']);
      const data = await friendsApi.getPendingRequests();
      // Sync friends list when pending requests change (fallback when socket is offline).
      if (pendingRequestsSignature(prev) !== pendingRequestsSignature(data)) {
        void qc.invalidateQueries({ queryKey: ['friends', 'all'] });
      }
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const sendRequest = useMutation({
    mutationFn: (userId: string) => friendsApi.sendRequest(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
    },
  });

  const accept = useMutation({
    mutationFn: (requestId: string) => friendsApi.accept(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const decline = useMutation({
    mutationFn: (requestId: string) => friendsApi.decline(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
    },
  });

  return { pendingRequests, isLoading, sendRequest, accept, decline };
}
