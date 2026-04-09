import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../chat.store';
import type { ChatMessage, TypingIndicator } from '@/types/message';

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    content: 'Hello',
    type: 'TEXT',
    isDeleted: false,
    isEdited: false,
    reactions: {},
    createdAt: '2024-01-01T00:00:00Z',
    roomId: 'room-1',
    sessionId: null,
    receiverId: null,
    sender: { id: 'user-1', username: 'alice' },
    ...overrides,
  };
}

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({ messagesByContext: {}, typingByContext: {} });
  });

  // ── setHistory ─────────────────────────────────────────────────────────────

  describe('setHistory', () => {
    it('stores messages under the given context key', () => {
      const msg = makeMessage();
      useChatStore.getState().setHistory('room:room-1', [msg]);

      expect(useChatStore.getState().messagesByContext['room:room-1']).toEqual([msg]);
    });

    it('replaces existing messages for the same key', () => {
      const msg1 = makeMessage({ id: 'msg-1' });
      const msg2 = makeMessage({ id: 'msg-2' });
      useChatStore.getState().setHistory('room:room-1', [msg1]);
      useChatStore.getState().setHistory('room:room-1', [msg2]);

      expect(useChatStore.getState().messagesByContext['room:room-1']).toEqual([msg2]);
    });
  });

  // ── addMessage ─────────────────────────────────────────────────────────────

  describe('addMessage', () => {
    it('appends a new message to the context', () => {
      const msg = makeMessage();
      useChatStore.getState().addMessage('room:room-1', msg);

      expect(useChatStore.getState().messagesByContext['room:room-1']).toContainEqual(msg);
    });

    it('deduplicates messages with the same id', () => {
      const msg = makeMessage({ id: 'dup' });
      useChatStore.getState().addMessage('room:room-1', msg);
      useChatStore.getState().addMessage('room:room-1', msg);

      expect(useChatStore.getState().messagesByContext['room:room-1']).toHaveLength(1);
    });

    it('removes matching temp message when real message arrives', () => {
      const tempMsg = makeMessage({ id: 'temp-abc', content: 'Hello' });
      useChatStore.getState().addMessage('room:room-1', tempMsg);

      const realMsg = makeMessage({ id: 'real-1', content: 'Hello' });
      useChatStore.getState().addMessage('room:room-1', realMsg);

      const msgs = useChatStore.getState().messagesByContext['room:room-1'];
      expect(msgs.some((m) => m.id === 'temp-abc')).toBe(false);
      expect(msgs.some((m) => m.id === 'real-1')).toBe(true);
    });

    it('caps history at 200 messages', () => {
      for (let i = 0; i < 205; i++) {
        useChatStore.getState().addMessage('room:room-1', makeMessage({ id: `msg-${i}` }));
      }

      expect(useChatStore.getState().messagesByContext['room:room-1'].length).toBeLessThanOrEqual(
        200
      );
    });
  });

  // ── updateReaction ─────────────────────────────────────────────────────────

  describe('updateReaction', () => {
    it('updates the reactions for a specific message', () => {
      const msg = makeMessage({ id: 'msg-1', reactions: {} });
      useChatStore.getState().setHistory('room:room-1', [msg]);

      const newReactions = { '👍': ['user-1', 'user-2'] };
      useChatStore.getState().updateReaction('room:room-1', 'msg-1', newReactions);

      const updated = useChatStore.getState().messagesByContext['room:room-1'][0];
      expect(updated.reactions).toEqual(newReactions);
    });

    it('does not mutate other messages', () => {
      const msg1 = makeMessage({ id: 'msg-1' });
      const msg2 = makeMessage({ id: 'msg-2' });
      useChatStore.getState().setHistory('room:room-1', [msg1, msg2]);

      useChatStore.getState().updateReaction('room:room-1', 'msg-1', { '❤️': ['user-1'] });

      const msgs = useChatStore.getState().messagesByContext['room:room-1'];
      expect(msgs[1].reactions).toEqual({});
    });
  });

  // ── setTyping / clearTyping ────────────────────────────────────────────────

  describe('setTyping', () => {
    it('adds a typing indicator for a user', () => {
      const indicator: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: true };
      useChatStore.getState().setTyping('room:room-1', indicator);

      expect(useChatStore.getState().typingByContext['room:room-1']).toContainEqual(indicator);
    });

    it('replaces existing entry for the same userId', () => {
      const first: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: true };
      const second: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: false };
      useChatStore.getState().setTyping('room:room-1', first);
      useChatStore.getState().setTyping('room:room-1', second);

      const indicators = useChatStore.getState().typingByContext['room:room-1'];
      expect(indicators).toHaveLength(1);
      expect(indicators[0].isTyping).toBe(false);
    });
  });

  describe('clearTyping', () => {
    it('removes a typing indicator for a specific user', () => {
      const indicator: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: true };
      useChatStore.getState().setTyping('room:room-1', indicator);
      useChatStore.getState().clearTyping('room:room-1', 'user-1');

      expect(useChatStore.getState().typingByContext['room:room-1']).toEqual([]);
    });

    it('only removes the specified user, not others', () => {
      const alice: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: true };
      const bob: TypingIndicator = { userId: 'user-2', username: 'bob', isTyping: true };
      useChatStore.getState().setTyping('room:room-1', alice);
      useChatStore.getState().setTyping('room:room-1', bob);
      useChatStore.getState().clearTyping('room:room-1', 'user-1');

      const indicators = useChatStore.getState().typingByContext['room:room-1'];
      expect(indicators).toHaveLength(1);
      expect(indicators[0].userId).toBe('user-2');
    });
  });

  // ── clearContext ───────────────────────────────────────────────────────────

  describe('clearContext', () => {
    it('removes all messages and typing indicators for a context', () => {
      const msg = makeMessage();
      const indicator: TypingIndicator = { userId: 'user-1', username: 'alice', isTyping: true };
      useChatStore.getState().setHistory('room:room-1', [msg]);
      useChatStore.getState().setTyping('room:room-1', indicator);

      useChatStore.getState().clearContext('room:room-1');

      expect(useChatStore.getState().messagesByContext['room:room-1']).toBeUndefined();
      expect(useChatStore.getState().typingByContext['room:room-1']).toBeUndefined();
    });

    it('does not affect other contexts', () => {
      useChatStore.getState().setHistory('room:room-1', [makeMessage()]);
      useChatStore.getState().setHistory('room:room-2', [makeMessage({ id: 'msg-2' })]);

      useChatStore.getState().clearContext('room:room-1');

      expect(useChatStore.getState().messagesByContext['room:room-2']).toBeDefined();
    });
  });
});
