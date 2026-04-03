import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { decodeJwtSub } from '@/lib/jwt';
import { Minimize2Icon, SendIcon, HashIcon, LockIcon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Props) {
  const { ctx, sendMessage, sendTyping } = useChat();

  const messagesByContext = useChatStore((s) => s.messagesByContext);
  const typingByContext = useChatStore((s) => s.typingByContext);

  const messages = ctx ? (messagesByContext[ctx.contextKey] ?? []) : [];

  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const selfId = decodeJwtSub(token) ?? (userId != null ? String(userId) : '');

  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const lastTypingEmitRef = useRef<number>(0);
  // Must be less than TYPING_CLEAR_MS (2500ms) in useChat so the receiver's
  // auto-clear timer is refreshed before it fires while the user is still typing.
  const TYPING_HEARTBEAT_MS = 2000;

  // Release pointer lock so the user can type
  useEffect(() => {
    document.exitPointerLock();
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Stop-typing when panel unmounts
  useEffect(() => {
    return () => {
      if (isTypingRef.current) {
        sendTyping(false);
        isTypingRef.current = false;
      }
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [sendTyping]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
    // Stop typing indicator immediately after sending
    if (typingRef.current) clearTimeout(typingRef.current);
    if (isTypingRef.current) {
      sendTyping(false);
      isTypingRef.current = false;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(e.target.value);

      // Re-emit typing:true on each keystroke, throttled to TYPING_HEARTBEAT_MS.
      // This keeps refreshing the receiver's auto-clear timer so the indicator
      // stays visible continuously while the user is actively typing.
      const now = Date.now();
      if (!isTypingRef.current || now - lastTypingEmitRef.current >= TYPING_HEARTBEAT_MS) {
        sendTyping(true);
        isTypingRef.current = true;
        lastTypingEmitRef.current = now;
      }
      if (typingRef.current) clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => {
        sendTyping(false);
        isTypingRef.current = false;
        lastTypingEmitRef.current = 0;
      }, 3000);
    },
    [sendTyping]
  );

  function handleBlur() {
    if (typingRef.current) clearTimeout(typingRef.current);
    if (isTypingRef.current) {
      sendTyping(false);
      isTypingRef.current = false;
    }
  }

  // ── Typing label ──────────────────────────────────────────────────────────

  const typingLabel = useMemo(() => {
    const users = ctx ? (typingByContext[ctx.contextKey] ?? []) : [];
    const active = users.filter((u) => u.isTyping && u.userId !== selfId);
    if (active.length === 0) return null;
    if (active.length === 1) return `${active[0].username} is typing…`;
    if (active.length === 2) return `${active[0].username} and ${active[1].username} are typing…`;
    return 'Several people are typing…';
  }, [typingByContext, ctx, selfId]);

  // Hold the label visible for a grace period after it goes null so the
  // indicator fades out smoothly instead of snapping off immediately.
  const [displayLabel, setDisplayLabel] = useState<string | null>(null);
  const [labelVisible, setLabelVisible] = useState(false);
  const labelHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typingLabel) {
      if (labelHoldRef.current) {
        clearTimeout(labelHoldRef.current);
        labelHoldRef.current = null;
      }
      // Use setTimeout(0) to avoid synchronous setState inside an effect body
      labelHoldRef.current = setTimeout(() => {
        setDisplayLabel(typingLabel);
        setLabelVisible(true);
      }, 0);
    } else {
      labelHoldRef.current = setTimeout(() => {
        setLabelVisible(false);
        labelHoldRef.current = setTimeout(() => setDisplayLabel(null), 300);
      }, 1500);
    }
    return () => {
      if (labelHoldRef.current) clearTimeout(labelHoldRef.current);
    };
  }, [typingLabel]);

  // ── Context label ─────────────────────────────────────────────────────────

  const contextIcon =
    ctx?.type === 'session' ? (
      <LockIcon className='size-3 text-white/40' />
    ) : (
      <HashIcon className='size-3 text-white/40' />
    );

  const contextLabel = ctx?.label ?? 'Chat';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className='pointer-events-auto absolute bottom-16 right-4 z-20
                  flex w-80 flex-col rounded-2xl border border-white/10
                  bg-black/75 text-white shadow-xl backdrop-blur-md'
      style={{ height: '420px' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div className='flex items-center gap-1.5 min-w-0'>
          {contextIcon}
          <span className='text-sm font-medium truncate'>{contextLabel}</span>
          {ctx?.type === 'session' && (
            <span className='shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50'>
              session
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className='ml-2 shrink-0 text-white/40 hover:text-white transition-colors'
        >
          <Minimize2Icon className='size-4' />
        </button>
      </div>

      {/* Message list */}
      <div className='flex-1 overflow-y-auto px-3 py-2 space-y-2'>
        {messages.length === 0 && (
          <p className='text-center text-xs text-white/30 pt-8'>No messages yet. Say hello!</p>
        )}

        {messages.map((msg) => {
          if (msg.isDeleted) return null;
          const isSelf = msg.sender?.id === selfId;

          return (
            <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              {/* Sender name (others only) */}
              {!isSelf && (
                <span className='mb-0.5 text-[10px] text-white/40'>{msg.sender.username}</span>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm leading-snug break-words
                  ${
                    isSelf
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm bg-white/10 text-white'
                  }`}
              >
                {msg.content}
              </div>

              {/* Timestamp */}
              <span className='mt-0.5 text-[9px] text-white/20'>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className='px-4 pb-1 h-4 flex items-center'>
        <span
          className='text-[10px] italic text-white/40 transition-opacity duration-300'
          style={{ opacity: labelVisible && displayLabel ? 1 : 0 }}
        >
          {displayLabel}
        </span>
      </div>

      {/* Input */}
      <div className='border-t border-white/10 px-3 py-2 flex items-center gap-2'>
        <input
          ref={inputRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={ctx ? `Message ${contextLabel}…` : 'Enter a zone to chat…'}
          disabled={!ctx}
          className='flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm
                     text-white placeholder-white/30 outline-none
                     focus:ring-1 focus:ring-white/20
                     disabled:opacity-40 disabled:cursor-not-allowed'
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || !ctx}
          className='flex h-8 w-8 items-center justify-center rounded-full
                     bg-blue-600 text-white hover:bg-blue-500
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors'
        >
          <SendIcon className='size-3.5' />
        </button>
      </div>
    </div>
  );
}
