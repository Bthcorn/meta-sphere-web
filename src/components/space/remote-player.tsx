import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useMutation } from '@tanstack/react-query';
import * as THREE from 'three';
import { UserPlus, Check } from 'lucide-react';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useAuthStore } from '@/store/auth.store';
import { useVoiceStore } from '@/store/voice.store';
import { friendsApi } from '@/api/friends';
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
};

function RemotePlayer({
  userId,
  username,
  position,
  color,
  bobOffset,
  rotationY,
  speaking,
}: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // ── Friend request mutation ───────────────────────────────────────────────
  const sendRequest = useMutation({
    mutationFn: () => friendsApi.sendRequest(userId),
    onSuccess: () => setRequestSent(true),
  });

  // ── Per-instance scratch objects ──────────────────────────────────────────
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
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <PlayerAvatar username={username} color={color} bobOffset={bobOffset} speaking={speaking} />

      {/* Hover popup — anchored above the avatar's head */}
      {hovered && (
        <Html
          position={[0, 1.5, 0]}
          center
          distanceFactor={7}
          occlude
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className='flex min-w-[130px] flex-col items-center gap-1.5 rounded-xl
                       border border-white/10 bg-[#0e0e1f]/90 px-3 py-2.5 shadow-xl
                       backdrop-blur-sm'
            style={{ pointerEvents: 'auto' }}
          >
            {/* Username */}
            <p className='text-xs font-semibold text-white/90'>{username}</p>

            {/* Divider */}
            <div className='h-px w-full bg-white/10' />

            {/* Add Friend button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!requestSent && !sendRequest.isPending) {
                  sendRequest.mutate();
                }
              }}
              disabled={requestSent || sendRequest.isPending}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg
                          px-2.5 py-1.5 text-xs font-medium transition
                          ${
                            requestSent
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-violet-600/80 text-white hover:bg-violet-500 disabled:opacity-50'
                          }`}
            >
              {requestSent ? (
                <>
                  <Check className='h-3 w-3' />
                  Request sent
                </>
              ) : sendRequest.isPending ? (
                'Sending…'
              ) : (
                <>
                  <UserPlus className='h-3 w-3' />
                  Add friend
                </>
              )}
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

export function RemotePlayers() {
  const users = useSpacePresenceStore((s) => s.users);
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);
  const speakingUserIds = useVoiceStore((s) => s.speakingUserIds);

  const selfId = decodeJwtSub(token) ?? (currentUserId != null ? String(currentUserId) : '');
  const remoteUsers = Object.values(users).filter((u) => String(u.userId) !== selfId);

  return (
    <>
      {remoteUsers.map(({ userId, username, position }) => (
        <RemotePlayer
          key={userId}
          userId={String(userId)}
          username={username}
          position={displayPosition(position)}
          color={colorFromUsername(username)}
          bobOffset={bobOffsetFromUsername(username)}
          rotationY={position.rotationY}
          speaking={speakingUserIds.has(String(userId))}
        />
      ))}
    </>
  );
}
