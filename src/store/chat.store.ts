import { create } from 'zustand';
import type { ChatMessage, TypingIndicator } from '@/types/message';

interface ChatState {
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setTyping: (user: TypingIndicator) => void;
  clearTyping: (userId: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  typingUsers: [],

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages.slice(-199), msg], // cap at 200
    })),

  setMessages: (msgs) => set({ messages: msgs }),

  setTyping: (user) =>
    set((s) => ({
      typingUsers: [...s.typingUsers.filter((u) => u.userId !== user.userId), user],
    })),

  clearTyping: (userId) =>
    set((s) => ({
      typingUsers: s.typingUsers.filter((u) => u.userId !== userId),
    })),

  clear: () => set({ messages: [], typingUsers: [] }),
}));
