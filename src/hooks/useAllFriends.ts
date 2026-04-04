import { useQuery } from '@tanstack/react-query';
import { friendsApi } from '@/api/friends';
import type { UserSummary } from '@/types/friend';

export function useAllFriends(): { friends: UserSummary[]; isLoading: boolean } {
  const { data = [], isLoading } = useQuery({
    queryKey: ['friends', 'all'],
    queryFn: () => friendsApi.getAll(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return { friends: data.map((e) => e.friend), isLoading };
}
