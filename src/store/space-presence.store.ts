import { create } from 'zustand';
import { socketManager } from '@/lib/socket';
import type { Position, UserStatePayload } from '@/types/socket';

const THROTTLE_MS = 50; // 20 updates/sec per spec

interface SpacePresenceState {
  users: Record<string, UserStatePayload>;
  lastPosition: Position | null;
  setUsersFromSnapshot: (users: UserStatePayload[]) => void;
  addUser: (user: UserStatePayload) => void;
  removeUser: (userId: string) => void;
  updateUserPosition: (user: UserStatePayload) => void;
  updatePosition: (position: Position) => void;
  /** Clear presence + emit throttle when leaving /space or swapping socket. */
  resetPresenceSession: () => void;
}

let lastEmitTime = 0;

export const useSpacePresenceStore = create<SpacePresenceState>()((set) => ({
  users: {},
  lastPosition: null,

  resetPresenceSession: () => {
    lastEmitTime = 0;
    set({ users: {}, lastPosition: null });
  },

  setUsersFromSnapshot: (users: UserStatePayload[]) => {
    const map = users.reduce<Record<string, UserStatePayload>>((acc, u) => {
      const id = String(u.userId);
      acc[id] = { ...u, userId: id };
      return acc;
    }, {});
    set({ users: map });
  },

  addUser: (user: UserStatePayload) =>
    set((state) => {
      const id = String(user.userId);
      return { users: { ...state.users, [id]: { ...user, userId: id } } };
    }),

  removeUser: (userId: string) =>
    set((state) => {
      const rest = { ...state.users };
      delete rest[String(userId)];
      return { users: rest };
    }),

  updateUserPosition: (user: UserStatePayload) =>
    set((state) => {
      const id = String(user.userId);
      return { users: { ...state.users, [id]: { ...user, userId: id } } };
    }),

  updatePosition: (position: Position) => {
    const now = Date.now();
    if (now - lastEmitTime < THROTTLE_MS) return;
    lastEmitTime = now;
    set({ lastPosition: position });
    socketManager.emit('update_position', position);
  },
}));
