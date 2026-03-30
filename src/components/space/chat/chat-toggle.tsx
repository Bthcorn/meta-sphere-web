import { useChatStore } from '@/store/chat.store';
import { MessageSquare } from 'lucide-react';

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function ChatToggle({ open, onToggle }: Props) {
  const messages = useChatStore((s) => s.messages);

  return (
    <button
      onClick={onToggle}
      className={`pointer-events-auto absolute bottom-4 right-4 z-20
                  flex h-11 w-11 items-center justify-center rounded-full
                  border border-white/10 backdrop-blur-md transition-all
                  ${
                    open
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/70 text-white/70 hover:bg-black/80 hover:text-white'
                  }`}
      title={open ? 'Close chat' : 'Open chat'}
    >
      <MessageSquare className='size-4' />
      {/* Unread badge — shows total message count when closed */}
      {!open && messages.length > 0 && (
        <span
          className='absolute -right-1 -top-1 flex h-4 w-4 items-center
                         justify-center rounded-full bg-red-500 text-[9px]
                         font-bold text-white'
        >
          {messages.length > 9 ? '9+' : messages.length}
        </span>
      )}
    </button>
  );
}
