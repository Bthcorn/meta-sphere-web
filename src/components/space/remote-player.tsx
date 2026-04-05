import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { UserPlus, Check, Users } from 'lucide-react';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useAuthStore } from '@/store/auth.store';
import { useVoiceStore } from '@/store/voice.store';
import { useAllFriends } from '@/hooks/useAllFriends';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { decodeJwtSub } from '@/lib/jwt';
import { DEFAULT_SPAWN } from '@/components/meta-sphere-3d/constants';
import { PlayerAvatar } from '@/components/avatar/player-avatar';
import { colorFromUsername, bobOffsetFromUsername } from '@/lib/avatar-utils';

function displayPosition(p: { x: number; y: number; z: number }): [number, number, number] {
  const { x, y, z } = p;
  if (Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6 && Math.abs(z) < 1e-6) {
    return DEFAULT_SPAWN;
  }
  return [x, y, z];
}

type RemotePlayerProps = {
  userId: string;
  username: string;
  position: [number, number, number];
  color: string;
  bobOffset: number;
  rotationY: number | undefined;
  speaking: boolean;
  isFriend: boolean;
  hasOutgoingFriendRequest: boolean;
};

function RemotePlayer({
  userId,
  username,
  position,
  color,
  bobOffset,
  rotationY,
  speaking,
  isFriend,
  hasOutgoingFriendRequest,
}: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { sendRequest } = useFriendRequests();
  // Store the userId the optimistic state belongs to; resets automatically when userId changes.
  const [optimisticSentId, setOptimisticSentId] = useState<string | null>(null);
  const sendLockRef = useRef(false);

  const showSent = hasOutgoingFriendRequest || optimisticSentId === userId;

  const tmpVec = useRef(new THREE.Vector3()).current;
  const tmpQuat = useRef(new THREE.Quaternion()).current;
  const tmpEuler = useRef(new THREE.Euler()).current;

  const faceAngleRef = useRef(rotationY ?? 0);
  const prevPosRef = useRef<[number, number, number]>([...position]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const [px, py, pz] = position;
    const [lpx, , lpz] = prevPosRef.current;

    if (rotationY !== undefined) {
      faceAngleRef.current = rotationY;
    } else {
      const dx = px - lpx;
      const dz = pz - lpz;
      if (dx * dx + dz * dz > 1e-4) {
        faceAngleRef.current = Math.atan2(dx, dz);
      }
    }

    prevPosRef.current = [px, py, pz];

    tmpVec.set(px, py, pz);
    groupRef.current.position.lerp(tmpVec, 1 - Math.exp(-12 * delta));

    tmpEuler.set(0, faceAngleRef.current, 0);
    tmpQuat.setFromEuler(tmpEuler);
    groupRef.current.quaternion.slerp(tmpQuat, 1 - Math.exp(-10 * delta));
  });

  return (
    <group ref={groupRef} position={position}>
      <PlayerAvatar
        username={username}
        color={color}
        bobOffset={bobOffset}
        speaking={speaking}
        showLabel={false}
      />

      <Html position={[0, 1.08, 0]} center distanceFactor={7} occlude zIndexRange={[100, 0]}>
        <div
          className={`flex max-w-[min(92vw,18rem)] items-center gap-2 rounded-full border px-2.5 py-1
                      text-xs font-semibold tracking-wide shadow-lg backdrop-blur-md
                      ${
                        speaking
                          ? 'border-emerald-400/60 bg-emerald-950/85 text-white'
                          : 'border-white/15 bg-[#0a0818]/75 text-white'
                      }`}
          style={{ pointerEvents: 'auto' }}
        >
          {speaking && (
            <span className='flex h-2.5 items-end gap-px'>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className='block w-0.5 rounded-sm bg-emerald-400'
                  style={{
                    animation: `remoteVoiceBar 0.6s ease-in-out ${i * 0.12}s infinite alternate`,
                  }}
                />
              ))}
              <style>{`
                @keyframes remoteVoiceBar {
                  from { height: 3px; }
                  to { height: 10px; }
                }
              `}</style>
            </span>
          )}
          <span className='min-w-0 shrink truncate'>{username}</span>
          <span className='h-3 w-px shrink-0 bg-white/20' aria-hidden />
          {isFriend ? (
            <span className='flex shrink-0 items-center gap-1 text-emerald-400'>
              <Users className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Friends</span>
            </span>
          ) : (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                if (sendLockRef.current || hasOutgoingFriendRequest || sendRequest.isPending)
                  return;
                sendLockRef.current = true;
                setOptimisticSentId(userId);
                sendRequest.mutate(userId, {
                  onError: () => {
                    sendLockRef.current = false;
                    setOptimisticSentId(null);
                  },
                });
              }}
              disabled={showSent || sendRequest.isPending}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium transition
                          ${
                            showSent
                              ? 'cursor-default bg-green-600/25 text-green-400'
                              : 'bg-violet-600/90 text-white hover:bg-violet-500 disabled:opacity-50'
                          }`}
            >
              {showSent ? (
                <>
                  <Check className='h-3 w-3' aria-hidden />
                  <span className='hidden sm:inline'>Sent</span>
                </>
              ) : sendRequest.isPending ? (
                '…'
              ) : (
                <>
                  <UserPlus className='h-3 w-3' />
                  <span className='hidden sm:inline'>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </Html>
    </group>
  );
}

export function RemotePlayers() {
  const users = useSpacePresenceStore((s) => s.users);
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);
  const speakingUserIds = useVoiceStore((s) => s.speakingUserIds);
  const { friends } = useAllFriends();
  const { pendingRequests } = useFriendRequests();

  const selfId = decodeJwtSub(token) ?? (currentUserId != null ? String(currentUserId) : '');
  const selfIdStr = String(selfId);
  const friendIds = new Set(friends.map((f) => String(f.id)));
  const outgoingRequestUserIds = new Set(
    pendingRequests
      .filter((r) => String(r.requesterId) === selfIdStr)
      .map((r) => String(r.addresseeId))
  );

  const remoteUsers = Object.values(users).filter((u) => String(u.userId) !== selfId);

  return (
    <>
      {remoteUsers.map(({ userId, username, position }) => {
        const idStr = String(userId);
        return (
          <RemotePlayer
            key={userId}
            userId={idStr}
            username={username}
            position={displayPosition(position)}
            color={colorFromUsername(username)}
            bobOffset={bobOffsetFromUsername(username)}
            rotationY={position.rotationY}
            speaking={speakingUserIds.has(idStr)}
            isFriend={friendIds.has(idStr)}
            hasOutgoingFriendRequest={outgoingRequestUserIds.has(idStr)}
          />
        );
      })}
    </>
  );
}
