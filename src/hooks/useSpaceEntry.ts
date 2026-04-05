import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { parseUserStatePayload, parseUserAvatarPayload } from '@/types/socket';
import { useSessionStore } from '@/store/session.store';

function attachPresenceListeners(socket: Socket) {
  const setUsersFromSnapshot = useSpacePresenceStore.getState().setUsersFromSnapshot;
  const addUser = useSpacePresenceStore.getState().addUser;
  const removeUser = useSpacePresenceStore.getState().removeUser;
  const updateUserPosition = useSpacePresenceStore.getState().updateUserPosition;
  const updateUserAvatar = useSpacePresenceStore.getState().updateUserAvatar;

  const onSessionEnded = () => {
    useSessionStore.getState().setActiveSession(null);
  };

  const onCurrentState = (...args: unknown[]) => {
    const raw = args[0];
    const list = Array.isArray(raw) ? raw : [];
    const users = list
      .map(parseUserStatePayload)
      .filter((u): u is NonNullable<typeof u> => u != null);
    setUsersFromSnapshot(users);
  };

  const onUserConnected = (...args: unknown[]) => {
    const user = parseUserStatePayload(args[0]);
    if (user) {
      addUser(user);

      // A new participant just joined — re-broadcast our position and avatar
      // so they can render us without waiting for our next input.
      const { lastPosition, lastAvatar } = useSpacePresenceStore.getState();
      if (lastPosition) socket.emit('update_position', lastPosition);
      if (lastAvatar) socket.emit('update_avatar', lastAvatar);
    }
  };

  const onUserDisconnected = (...args: unknown[]) => {
    const id = args[0];
    if (id !== undefined && id !== null) removeUser(String(id));
  };

  const onUserMoved = (...args: unknown[]) => {
    const user = parseUserStatePayload(args[0]);
    if (user) updateUserPosition(user);
  };

  const onUserAvatarUpdated = (...args: unknown[]) => {
    const payload = parseUserAvatarPayload(args[0]);
    if (payload) updateUserAvatar(payload.userId, payload.avatar);
  };

  socket.on('session:ended', onSessionEnded);
  socket.on('current_state', onCurrentState);
  socket.on('user_connected', onUserConnected);
  socket.on('user_disconnected', onUserDisconnected);
  socket.on('user_moved', onUserMoved);
  socket.on('user_avatar_updated', onUserAvatarUpdated);

  return () => {
    socket.off('session:ended', onSessionEnded);
    socket.off('current_state', onCurrentState);
    socket.off('user_connected', onUserConnected);
    socket.off('user_disconnected', onUserDisconnected);
    socket.off('user_moved', onUserMoved);
    socket.off('user_avatar_updated', onUserAvatarUpdated);
  };
}

/**
 * Subscribes to RealtimeGateway presence.
 * - Waits for `socketManager.instance` (can lag SocketInitializer by one frame).
 * - Re-binds on `connect` / `reconnect`.
 * - If already connected when /space mounts, emits `request_state` to get a fresh snapshot
 *   without triggering the reconnect race condition.
 */
export function useSpaceEntry() {
  const token = useAuthStore((s) => s.token);
  const updatePosition = useSpacePresenceStore((s) => s.updatePosition);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    let detachPresence: (() => void) | undefined;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let maxId: ReturnType<typeof setTimeout> | null = null;
    let hookedSocket: Socket | null = null;

    const bind = () => {
      detachPresence?.();
      const s = socketManager.instance;
      if (!s || cancelled) return;
      detachPresence = attachPresenceListeners(s);
    };

    const attachConnectionHooks = (socket: Socket) => {
      hookedSocket = socket;
      socket.on('connect', bind);
      socket.on('reconnect', bind);
      bind();

      if (socket.connected) {
        // Request a fresh state snapshot without reconnecting.
        // Reconnecting (disconnect + connect) risks a server-side race condition
        // where the new handleConnection fires before the old disconnect is processed,
        // causing the server to reject the new connection as a duplicate.
        socket.emit('request_state');
      }
    };

    const start = (): boolean => {
      const socket = socketManager.instance;
      if (!socket || cancelled) return false;
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
      if (maxId) {
        clearTimeout(maxId);
        maxId = null;
      }
      attachConnectionHooks(socket);
      return true;
    };

    if (!start()) {
      pollId = setInterval(() => {
        if (start() || cancelled) {
          if (pollId) clearInterval(pollId);
          pollId = null;
        }
      }, 50);
      maxId = setTimeout(() => {
        if (pollId) clearInterval(pollId);
        pollId = null;
        if (import.meta.env.DEV) {
          console.warn(
            '[presence] No socket instance after 8s — is the API running and SocketInitializer connected?'
          );
        }
      }, 8000);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      if (maxId) clearTimeout(maxId);
      hookedSocket?.off('connect', bind);
      hookedSocket?.off('reconnect', bind);
      detachPresence?.();
      useSpacePresenceStore.getState().resetPresenceSession();
    };
  }, [token]);

  return { updatePosition };
}
