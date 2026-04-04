import { useQuery } from '@tanstack/react-query';
import { friendsApi } from '@/api/friends';
import type { UserSummary } from '@/types/friend';

export function useOnlineFriends(): { onlineFriends: UserSummary[]; isLoading: boolean } {
  const { data = [], isLoading } = useQuery({
    queryKey: ['friends', 'online'],
    queryFn: () => friendsApi.getOnline(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const onlineFriends = data.map((entry) => entry.friend);

  return { onlineFriends, isLoading };
}
