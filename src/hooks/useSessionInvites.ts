import { useEffect } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useSessionInviteStore } from '@/store/session-invites.store';
import type { SessionInvite } from '@/types/session';

export function useSessionInvites() {
  const addInvite = useSessionInviteStore((s) => s.addInvite);

  useEffect(() => {
    const socket = socketManager.instance;
    if (!socket) return;

    const handleInvite = (invite: SessionInvite) => addInvite(invite);

    socket.on('session_invitation', handleInvite);
    return () => {
      socket.off('session_invitation', handleInvite);
    };
  }, [addInvite]);
}
