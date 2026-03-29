import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/api/messages.api';
import { useChatStore } from '@/store/chat.store';
import { useSessionStore } from '@/store/session.store';
import { socketManager } from '@/lib/socket-manager';
import type { ChatMessage, TypingIndicator } from '@/types/message';

const TYPING_CLEAR_MS = 2500;

export function useChat() {
  const { addMessage, setMessages, setTyping, clearTyping } = useChatStore();
  const { activeSession, currentZoneConfig } = useSessionStore();
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // The room to chat in: session room → zone room → common_area fallback
  const chatRoomId = activeSession?.roomId ?? currentZoneConfig?.roomId ?? 'common_area';

  // Load history when room changes
  const { data: history } = useQuery({
    queryKey: ['messages', chatRoomId],
    queryFn: () => messagesApi.getRoomMessages(chatRoomId),
    enabled: chatRoomId !== 'common_area',
    staleTime: 30_000,
  });

  useEffect(() => {
    if (history) setMessages(history);
  }, [history, setMessages]);

  // Socket listeners
  useEffect(() => {
    const socket = socketManager.instance;
    if (!socket) return;

    const onMessage = (msg: ChatMessage) => addMessage(msg);

    const onTyping = (user: TypingIndicator) => {
      setTyping(user);
      // Auto-clear after silence
      const existing = typingTimers.current.get(user.userId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => clearTyping(user.userId), TYPING_CLEAR_MS);
      typingTimers.current.set(user.userId, timer);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [addMessage, setTyping, clearTyping]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      socketManager.emit('chat:send', { content: content.trim(), roomId: chatRoomId });
    },
    [chatRoomId]
  );

  const sendTyping = useCallback(() => {
    socketManager.emit('chat:typing');
  }, []);

  return { chatRoomId, sendMessage, sendTyping };
}
