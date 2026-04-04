import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '@/api/friends';

export function useFriendRequests() {
  const qc = useQueryClient();

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: () => friendsApi.getPendingRequests(),
    staleTime: 15_000,
    refetchInterval: 30_000,
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

  return { pendingRequests, isLoading, accept, decline };
}
