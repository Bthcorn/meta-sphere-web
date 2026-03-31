import { useChatStore } from '@/store/chat.store';
import { useChat } from '@/hooks/useChat';
import { MessageSquare } from 'lucide-react';

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function ChatToggle({ open, onToggle }: Props) {
  const { ctx } = useChat();
  const messagesByContext = useChatStore((s) => s.messagesByContext);
  const count = ctx ? (messagesByContext[ctx.contextKey]?.length ?? 0) : 0;

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
      {!open && count > 0 && (
        <span
          className='absolute -right-1 -top-1 flex h-4 w-4 items-center
                         justify-center rounded-full bg-red-500 text-[9px]
                         font-bold text-white'
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
