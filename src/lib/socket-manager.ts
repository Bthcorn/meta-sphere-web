import { io, type Socket } from 'socket.io-client';

export class SocketManager {
  #socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.#socket) {
      return this.#socket;
    }

    const url = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

    this.#socket = io(url, {
      query: { token },
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
