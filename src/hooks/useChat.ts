import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '@/api/messages.api';
import { useChatStore } from '@/store/chat.store';
import { useSessionStore } from '@/store/session.store';
import { useSocketStore } from '@/store/socket.store';
import { socketManager } from '@/lib/socket-manager';
import { ZONE_CONFIG } from '@/config/zone-sessions';
import type { ChatMessage, ChatReaction, TypingIndicator } from '@/types/message';

const TYPING_CLEAR_MS = 5000;

// Spawn area and chilling zone share the same open-area room.
const COMMON_ZONE = ZONE_CONFIG.zone_chilling;

/** Derives the current chat context from session/zone state. */
function useChatContext() {
  const { activeSession, currentZoneConfig, currentAreaZone } = useSessionStore();

  if (activeSession) {
    return {
      type: 'session' as const,
      contextKey: `session:${activeSession.id}`,
      sessionId: activeSession.id,
      roomId: currentZoneConfig?.roomId ?? COMMON_ZONE.roomId,
      label: activeSession.title,
    };
  }

  // Use the physical area the player is standing in (whole-room sensor), not the
  // panel trigger zone — so chat switches when you walk into a new area regardless
  // of whether you've opened the zone panel.
  const zone = currentAreaZone ?? COMMON_ZONE;

  return {
    type: 'room' as const,
    contextKey: `room:${zone.roomId}`,
    sessionId: undefined,
    roomId: zone.roomId,
    label: zone.label,
  };
}

export function useChat() {
  const ctx = useChatContext();
  const { setHistory, addMessage, updateReaction, setTyping, clearTyping } = useChatStore();
  const isConnected = useSocketStore((s) => s.isConnected);
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── History loading ────────────────────────────────────────────────────────
  useQuery({
    queryKey: ['chat-history', ctx?.contextKey],
    enabled: !!ctx,
    staleTime: 30_000,
    queryFn: async () => {
      if (!ctx) return [];
      const msgs =
        ctx.type === 'session'
          ? await messagesApi.getSessionMessages(ctx.sessionId!)
          : await messagesApi.getRoomMessages(ctx.roomId);
      setHistory(ctx.contextKey, msgs);
      return msgs;
    },
  });

  // ── Join / leave the server-side socket room for this context ────────────
  // The ChatGateway broadcasts via `this.server.to('room:id')` — clients must
  // be in that room or they never receive the events.
  useEffect(() => {
    if (!isConnected || !ctx) return;

    const payload = ctx.type === 'session' ? { sessionId: ctx.sessionId } : { roomId: ctx.roomId };

    socketManager.emit('chat:join', payload);

    return () => {
      socketManager.emit('chat:leave', payload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.contextKey, isConnected]);

  // ── Socket listeners (re-register when context or connection changes) ───────
  useEffect(() => {
    if (!isConnected || !ctx) return;
    const socket = socketManager.instance;
    if (!socket) return;

    const { contextKey } = ctx;

    // Backend uses `this.server.to(room).emit('chat:message', prismaMessage)`.
    // The Prisma message includes roomId/sessionId — use them to filter to the
    // current context. Fall back to accepting the message if neither is present.
    const onMessage = (msg: ChatMessage) => {
      const msgKey = msg.sessionId
        ? `session:${msg.sessionId}`
        : msg.roomId
          ? `room:${msg.roomId}`
          : null;
      if (!msgKey || msgKey === contextKey) {
        addMessage(contextKey, msg);
      }
    };

    // Backend uses `client.to(scope).emit('chat:typing', {userId, username, isTyping})`.
    // sender is excluded by socket.io's client.to(), so no self-filter needed here.
    const onTyping = (user: TypingIndicator) => {
      setTyping(contextKey, user);
      // Auto-clear — server TTL is 4s, client mirrors at 2.5s
      const existing = typingTimers.current.get(user.userId);
      if (existing) clearTimeout(existing);
      if (user.isTyping) {
        const timer = setTimeout(() => clearTyping(contextKey, user.userId), TYPING_CLEAR_MS);
        typingTimers.current.set(user.userId, timer);
      } else {
        clearTyping(contextKey, user.userId);
      }
    };

    // Backend emits `chat:reaction` with { messageId, reactions } after toggleReaction.
    const onReaction = ({ messageId, reactions }: ChatReaction) => {
      updateReaction(contextKey, messageId, reactions);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:reaction', onReaction);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:reaction', onReaction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.contextKey, isConnected, addMessage, updateReaction, setTyping, clearTyping]);

  // ── Emit helpers ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !ctx) return;
      socketManager.emit('chat:send', {
        content: content.trim(),
        roomId: ctx.roomId,
        sessionId: ctx.sessionId,
      });
    },
    [ctx]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!ctx) return;
      socketManager.emit('chat:typing', {
        roomId: ctx.roomId,
        sessionId: ctx.sessionId,
        isTyping,
      });
    },
    [ctx]
  );

  return { ctx, sendMessage, sendTyping };
}
