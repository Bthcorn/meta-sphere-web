import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/meta-sphere-3d/Avatar';
import { AVATAR_COLORS } from '@/components/meta-sphere-3d/constants';

function hashUserId(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h << 5) - h + userId.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function RemoteAvatars() {
  const users = useSpacePresenceStore((s) => s.users);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const remoteUsers = Object.values(users).filter((u) => u.userId !== currentUserId);

  return (
    <>
      {remoteUsers.map(({ userId, position }) => (
        <Avatar
          key={userId}
          position={[position.x, position.y, position.z]}
          color={AVATAR_COLORS[hashUserId(userId) % AVATAR_COLORS.length]}
          bobOffset={((hashUserId(userId) % 100) / 100) * Math.PI * 2}
          rotationY={0}
        />
      ))}
    </>
  );
}
