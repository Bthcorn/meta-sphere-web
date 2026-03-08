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

let connectHandler: () => void;
let disconnectHandler: () => void;
let connectErrorHandler: (...args: unknown[]) => void;

function removeHandlers(): void {
  socketManager.off('connect', connectHandler);
  socketManager.off('disconnect', disconnectHandler);
  socketManager.off('connect_error', connectErrorHandler);
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

    socketManager.on('connect', connectHandler);
    socketManager.on('disconnect', disconnectHandler);
    socketManager.on('connect_error', connectErrorHandler);

    socketManager.connect(token);

    if (socketManager.isConnected) {
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
