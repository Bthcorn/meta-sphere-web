import { Users } from 'lucide-react';
import { useFriendRequests } from '@/hooks/useFriendRequests';

interface Props {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

export function FriendsToggle({ open, onToggle, className = 'right-36' }: Props) {
  const { pendingRequests } = useFriendRequests();
  const badgeCount = pendingRequests.length;

  return (
    <button
      onClick={onToggle}
      className={`pointer-events-auto absolute bottom-4 z-20
                  flex h-11 w-11 items-center justify-center rounded-full
                  border border-white/10 backdrop-blur-md transition-all
                  ${className}
                  ${
                    open
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/70 text-white/70 hover:bg-black/80 hover:text-white'
                  }`}
      title={open ? 'Close friends' : 'Friends'}
    >
      <Users className='size-4' />
      {!open && badgeCount > 0 && (
        <span
          className='absolute -right-1 -top-1 flex h-4 w-4 items-center
                     justify-center rounded-full bg-red-500 text-[9px]
                     font-bold text-white'
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  );
}
