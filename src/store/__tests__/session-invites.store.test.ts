import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionInviteStore } from '../session-invites.store';
import type { SessionInvite } from '@/types/session';

function makeInvite(sessionId: string): SessionInvite {
  return {
    sessionId,
    roomId: `room-${sessionId}`,
    hostId: 'user-1',
    sessionTitle: 'Team Meeting',
    sessionType: 'MEETING',
    inviteToken: `token-${sessionId}`,
  };
}

describe('useSessionInviteStore', () => {
  beforeEach(() => {
    useSessionInviteStore.setState({ pendingInvites: [] });
  });

  // ── addInvite ──────────────────────────────────────────────────────────────

  describe('addInvite', () => {
    it('adds an invite to the pending list', () => {
      useSessionInviteStore.getState().addInvite(makeInvite('sess-1'));
      expect(useSessionInviteStore.getState().pendingInvites).toHaveLength(1);
    });

    it('replaces an existing invite for the same sessionId (no duplicates)', () => {
      const first = { ...makeInvite('sess-1'), inviteToken: 'old-token' };
      const second = { ...makeInvite('sess-1'), inviteToken: 'new-token' };

      useSessionInviteStore.getState().addInvite(first);
      useSessionInviteStore.getState().addInvite(second);

      const invites = useSessionInviteStore.getState().pendingInvites;
      expect(invites).toHaveLength(1);
      expect(invites[0].inviteToken).toBe('new-token');
    });

    it('keeps invites for different sessions separate', () => {
      useSessionInviteStore.getState().addInvite(makeInvite('sess-1'));
      useSessionInviteStore.getState().addInvite(makeInvite('sess-2'));
      expect(useSessionInviteStore.getState().pendingInvites).toHaveLength(2);
    });
  });

  // ── dismissInvite ──────────────────────────────────────────────────────────

  describe('dismissInvite', () => {
    it('removes the invite with the matching sessionId', () => {
      useSessionInviteStore.getState().addInvite(makeInvite('sess-1'));
      useSessionInviteStore.getState().dismissInvite('sess-1');
      expect(useSessionInviteStore.getState().pendingInvites).toHaveLength(0);
    });

    it('does not affect other invites', () => {
      useSessionInviteStore.getState().addInvite(makeInvite('sess-1'));
      useSessionInviteStore.getState().addInvite(makeInvite('sess-2'));
      useSessionInviteStore.getState().dismissInvite('sess-1');

      const invites = useSessionInviteStore.getState().pendingInvites;
      expect(invites).toHaveLength(1);
      expect(invites[0].sessionId).toBe('sess-2');
    });

    it('is a no-op when the sessionId does not exist', () => {
      useSessionInviteStore.getState().addInvite(makeInvite('sess-1'));
      useSessionInviteStore.getState().dismissInvite('non-existent');
      expect(useSessionInviteStore.getState().pendingInvites).toHaveLength(1);
    });
  });
});
