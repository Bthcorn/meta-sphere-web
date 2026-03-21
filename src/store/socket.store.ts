import { create } from 'zustand';
import { socketManager } from '@/lib/socket';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentRoomId: string | null;
  connect: (token: string) => void;
  disconnect: () => void;
  setCurrentRoom: (roomId: string | null) => void;
}

type SetState = (
  partial: Partial<SocketState> | ((state: SocketState) => Partial<SocketState>)
) => void;

let connectHandler: (() => void) | undefined;
let disconnectHandler: (() => void) | undefined;
let connectErrorHandler: ((...args: unknown[]) => void) | undefined;

function removeHandlers(): void {
  // Use the socket instance directly to guarantee off() is never a no-op.
  const socket = socketManager.instance;
  if (!socket) return;
  if (connectHandler) socket.off('connect', connectHandler);
  if (disconnectHandler) socket.off('disconnect', disconnectHandler);
  if (connectErrorHandler) socket.off('connect_error', connectErrorHandler);
}

export const useSocketStore = create<SocketState>()((set: SetState) => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  currentRoomId: null,

  connect: (token: string) => {
    removeHandlers();

    set({ isConnecting: true, error: null });

    connectHandler = () => set({ isConnected: true, isConnecting: false });
    disconnectHandler = () => set({ isConnected: false });
    connectErrorHandler = (...args: unknown[]) => {
      const err = args[0] instanceof Error ? args[0] : new Error(String(args[0]));
      set({ error: err.message, isConnecting: false });
    };

    // connect() creates the socket and returns it — attach listeners immediately
    // so they are registered before the async handshake completes.
    const socket = socketManager.connect(token);
    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);
    socket.on('connect_error', connectErrorHandler);

    if (socket.connected) {
      set({ isConnected: true, isConnecting: false });
    }
  },

  disconnect: () => {
    removeHandlers();
    socketManager.disconnect();
    set({ isConnected: false, isConnecting: false, currentRoomId: null });
  },

  setCurrentRoom: (roomId: string | null) => set({ currentRoomId: roomId }),
}));
