import { useEffect, useRef } from 'react';
import { useSocketStore } from '@/store/socket.store';
import { useAuthStore } from '@/store/auth.store';

export function SocketInitializer() {
  const token = useAuthStore((state) => state.token);
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const disconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }

    const tokenChanged = prevTokenRef.current !== token;
    prevTokenRef.current = token;

    if (token) {
      if (tokenChanged) {
        disconnect();
      }
      connect(token);
    } else {
      disconnect();
    }

    return () => {
      disconnectTimeoutRef.current = setTimeout(() => {
        disconnect();
        disconnectTimeoutRef.current = null;
      }, 100);
    };
  }, [token, connect, disconnect]);

  return null;
}
