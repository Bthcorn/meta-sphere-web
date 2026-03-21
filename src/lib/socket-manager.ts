import { io, type Socket } from 'socket.io-client';

/**
 * Socket.IO is on the HTTP server root, not under `/api` (see REALTIME_SPEC.md).
 * When no URL env is set, use the page origin so Vite can proxy `/socket.io` in dev.
 */
function socketOriginUrl(): string {
  const explicit =
    import.meta.env.VITE_SOCKET_URL ??
    import.meta.env.VITE_API_ORIGIN ??
    import.meta.env.VITE_API_URL;

  if (explicit != null && String(explicit).trim() !== '') {
    let origin = String(explicit).replace(/\/api\/?$/, '');
    if (!origin || origin === '/') origin = 'http://localhost:3000';
    return origin;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

export class SocketManager {
  #socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.#socket) {
      return this.#socket;
    }

    const url = socketOriginUrl();

    this.#socket = io(url, {
      query: { token },
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    return this.#socket;
  }

  disconnect(): void {
    if (this.#socket) {
      this.#socket.disconnect();
      this.#socket = null;
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.#socket?.connected) {
      this.#socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.#socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.#socket?.off(event, callback);
    } else {
      this.#socket?.off(event);
    }
  }

  get instance(): Socket | null {
    return this.#socket;
  }

  get isConnected(): boolean {
    return this.#socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();
