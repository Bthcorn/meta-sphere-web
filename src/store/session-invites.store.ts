import { create } from 'zustand';
import type { SessionInvite } from '@/types/session';

interface SessionInviteStore {
  pendingInvites: SessionInvite[];
  addInvite: (invite: SessionInvite) => void;
  dismissInvite: (sessionId: string) => void;
}

export const useSessionInviteStore = create<SessionInviteStore>((set) => ({
  pendingInvites: [],

  addInvite: (invite) =>
    set((s) => ({
      pendingInvites: [...s.pendingInvites.filter((i) => i.sessionId !== invite.sessionId), invite],
    })),

  dismissInvite: (sessionId) =>
    set((s) => ({
      pendingInvites: s.pendingInvites.filter((i) => i.sessionId !== sessionId),
    })),
}));
