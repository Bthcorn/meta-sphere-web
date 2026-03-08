import { useEffect, useRef } from 'react';
import { socketManager } from '@/lib/socket';
import { useSocketStore } from '@/store/socket.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import type { UserStatePayload } from '@/types/socket';

export function useSpaceEntry() {
  const isConnected = useSocketStore((s) => s.isConnected);
  const setUsersFromSnapshot = useSpacePresenceStore((s) => s.setUsersFromSnapshot);
  const addUser = useSpacePresenceStore((s) => s.addUser);
  const removeUser = useSpacePresenceStore((s) => s.removeUser);
  const updateUserPosition = useSpacePresenceStore((s) => s.updateUserPosition);
  const updatePosition = useSpacePresenceStore((s) => s.updatePosition);
  const connectHandlerRef = useRef<(() => void) | null>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const setupListeners = (): (() => void) => {
      const onCurrentState = (...args: unknown[]) => {
        const users = args[0] as UserStatePayload[];
        setUsersFromSnapshot(users);
      };
      const onUserConnected = (...args: unknown[]) => {
        const user = args[0] as UserStatePayload;
        addUser(user);
      };
      const onUserDisconnected = (...args: unknown[]) => {
        const userId = args[0] as string;
        removeUser(userId);
      };
      const onUserMoved = (...args: unknown[]) => {
        const user = args[0] as UserStatePayload;
        updateUserPosition(user);
      };

      socketManager.on('current_state', onCurrentState);
      socketManager.on('user_connected', onUserConnected);
      socketManager.on('user_disconnected', onUserDisconnected);
      socketManager.on('user_moved', onUserMoved);

      return () => {
        socketManager.off('current_state', onCurrentState);
        socketManager.off('user_connected', onUserConnected);
        socketManager.off('user_disconnected', onUserDisconnected);
        socketManager.off('user_moved', onUserMoved);
      };
    };

    if (isConnected) {
      listenersCleanupRef.current = setupListeners();
    } else {
      const onConnect = () => {
        listenersCleanupRef.current = setupListeners();
        socketManager.off('connect', onConnect);
        connectHandlerRef.current = null;
      };
      connectHandlerRef.current = onConnect;
      socketManager.on('connect', onConnect);
    }

    return () => {
      const handler = connectHandlerRef.current;
      if (handler) {
        socketManager.off('connect', handler);
        connectHandlerRef.current = null;
      }
      listenersCleanupRef.current?.();
      listenersCleanupRef.current = null;
      useSpacePresenceStore.setState({ users: {} });
    };
  }, [isConnected, setUsersFromSnapshot, addUser, removeUser, updateUserPosition]);

  return { updatePosition };
}
