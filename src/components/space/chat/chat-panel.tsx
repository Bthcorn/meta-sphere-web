import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { decodeJwtSub } from '@/lib/jwt';
import { Minimize2Icon, SendIcon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Props) {
  const { sendMessage, sendTyping } = useChat();
  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const selfId = decodeJwtSub(token) ?? (userId != null ? String(userId) : '');

  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Unlock pointer lock so user can type
  useEffect(() => {
    document.exitPointerLock();
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value);
    sendTyping();
  }

  return (
    <div
      className='pointer-events-auto absolute bottom-16 right-4 z-20
                  flex w-80 flex-col rounded-2xl border border-white/10
                  bg-black/75 text-white shadow-xl backdrop-blur-md'
      style={{ height: '420px' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <span className='text-sm font-medium'>Chat</span>
        <button onClick={onClose} className='text-white/40 hover:text-white transition-colors'>
          <Minimize2Icon className='size-4' />
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-3 py-2 space-y-2'>
        {messages.length === 0 && (
          <p className='text-center text-xs text-white/30 pt-8'>No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isSelf = msg.senderId === selfId;
          if (msg.isDeleted) return null;
          return (
            <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              {!isSelf && (
                <span className='mb-0.5 text-[10px] text-white/40'>{msg.sender.username}</span>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm leading-snug
                             ${
                               isSelf
                                 ? 'rounded-br-sm bg-blue-600 text-white'
                                 : 'rounded-bl-sm bg-white/10 text-white'
                             }`}
              >
                {msg.content}
              </div>
              {msg.isEdited && <span className='mt-0.5 text-[9px] text-white/25'>edited</span>}
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className='text-[10px] text-white/40 italic'>
            {typingUsers.map((u) => u.username).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='border-t border-white/10 px-3 py-2 flex items-center gap-2'>
        <input
          ref={inputRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Message...'
          className='flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm
                     text-white placeholder-white/30 outline-none
                     focus:ring-1 focus:ring-white/20'
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className='flex h-8 w-8 items-center justify-center rounded-full
                     bg-blue-600 text-white hover:bg-blue-500
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <SendIcon className='size-3.5' />
        </button>
      </div>
    </div>
  );
}
