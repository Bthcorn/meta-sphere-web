import { create } from 'zustand';
import type { ChatMessage, TypingIndicator } from '@/types/message';

interface ChatState {
  messagesByContext: Record<string, ChatMessage[]>;
  typingByContext: Record<string, TypingIndicator[]>;

  setHistory: (contextKey: string, msgs: ChatMessage[]) => void;
  addMessage: (contextKey: string, msg: ChatMessage) => void;
  updateReaction: (
    contextKey: string,
    messageId: string,
    reactions: Record<string, string[]>
  ) => void;
  setTyping: (contextKey: string, user: TypingIndicator) => void;
  clearTyping: (contextKey: string, userId: string) => void;
  clearContext: (contextKey: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messagesByContext: {},
  typingByContext: {},

  setHistory: (key, msgs) =>
    set((s) => ({
      messagesByContext: { ...s.messagesByContext, [key]: msgs },
    })),

  addMessage: (key, msg) =>
    set((s) => {
      const prev = s.messagesByContext[key] ?? [];
      // Deduplicate by id — guard against REST history + socket event overlap
      if (prev.some((m) => m.id === msg.id)) return s;
      // When the real server message arrives, remove any matching optimistic temp message
      const base = msg.id.startsWith('temp-')
        ? prev
        : prev.filter(
            (m) =>
              !(
                m.id.startsWith('temp-') &&
                m.sender?.id === msg.sender?.id &&
                m.content === msg.content
              )
          );
      return {
        messagesByContext: {
          ...s.messagesByContext,
          [key]: [...base.slice(-199), msg],
        },
      };
    }),

  updateReaction: (key, messageId, reactions) =>
    set((s) => ({
      messagesByContext: {
        ...s.messagesByContext,
        [key]: (s.messagesByContext[key] ?? []).map((m) =>
          m.id === messageId ? { ...m, reactions } : m
        ),
      },
    })),

  setTyping: (key, user) =>
    set((s) => {
      const prev = s.typingByContext[key] ?? [];
      return {
        typingByContext: {
          ...s.typingByContext,
          [key]: [...prev.filter((u) => u.userId !== user.userId), user],
        },
      };
    }),

  clearTyping: (key, userId) =>
    set((s) => ({
      typingByContext: {
        ...s.typingByContext,
        [key]: (s.typingByContext[key] ?? []).filter((u) => u.userId !== userId),
      },
    })),

  clearContext: (key) =>
    set((s) => {
      const msgs = { ...s.messagesByContext };
      const typs = { ...s.typingByContext };
      delete msgs[key];
      delete typs[key];
      return { messagesByContext: msgs, typingByContext: typs };
    }),
}));
