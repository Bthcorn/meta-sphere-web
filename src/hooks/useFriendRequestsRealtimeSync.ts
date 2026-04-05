import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '@/lib/socket-manager';
import { useSocketStore } from '@/store/socket.store';

/**
 * Listens for `friend_requests:updated` socket events and invalidates all friend
 * queries immediately. Falls back to polling in `useFriendRequests` when offline.
 */
export function useFriendRequestsRealtimeSync() {
  const qc = useQueryClient();
  const isConnected = useSocketStore((s) => s.isConnected);

  useEffect(() => {
    if (!isConnected) return;
    const socket = socketManager.instance;
    if (!socket) return;

    const invalidateFriends = () => {
      void qc.invalidateQueries({ queryKey: ['friends'] });
    };

    socket.on('friend_requests:updated', invalidateFriends);
    return () => {
      socket.off('friend_requests:updated', invalidateFriends);
    };
  }, [qc, isConnected]);
}
