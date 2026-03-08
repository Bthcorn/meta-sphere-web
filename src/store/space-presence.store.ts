import { create } from 'zustand';
import { socketManager } from '@/lib/socket';
import type { Position, UserStatePayload } from '@/types/socket';

const THROTTLE_MS = 50; // 20 updates/sec per spec

interface SpacePresenceState {
  users: Record<string, UserStatePayload>;
  setUsersFromSnapshot: (users: UserStatePayload[]) => void;
  addUser: (user: UserStatePayload) => void;
  removeUser: (userId: string) => void;
  updateUserPosition: (user: UserStatePayload) => void;
  updatePosition: (position: Position) => void;
}

let lastEmitTime = 0;

export const useSpacePresenceStore = create<SpacePresenceState>()((set) => ({
  users: {},

  setUsersFromSnapshot: (users: UserStatePayload[]) => {
    const map = users.reduce<Record<string, UserStatePayload>>((acc, u) => {
      acc[u.userId] = u;
      return acc;
    }, {});
    set({ users: map });
  },

  addUser: (user: UserStatePayload) =>
    set((state) => ({
      users: { ...state.users, [user.userId]: user },
    })),

  removeUser: (userId: string) =>
    set((state) => {
      const rest = { ...state.users };
      delete rest[userId];
      return { users: rest };
    }),

  updateUserPosition: (user: UserStatePayload) =>
    set((state) => ({
      users: { ...state.users, [user.userId]: user },
    })),

  updatePosition: (position: Position) => {
    const now = Date.now();
    if (now - lastEmitTime < THROTTLE_MS) return;
    lastEmitTime = now;
    socketManager.emit('update_position', position);
  },
}));
