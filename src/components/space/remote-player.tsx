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
import {
  colorFromUsername,
  bobOffsetFromUsername,
  shirtColorFromUsername,
} from '@/lib/avatar-utils';
import { SHIRT_COLOR_MAP } from '@/store/avatar.store';

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
  shirtColor: string;
  glassesId: string;
  hatId: string;
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
  shirtColor,
  glassesId,
  hatId,
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
        shirtColor={shirtColor}
        glassesId={glassesId}
        hatId={hatId}
        bobOffset={bobOffset}
        speaking={speaking}
      />
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
        const av = position.avatar;
        const skinColor = av?.skinColor ?? colorFromUsername(username);
        const shirtColor = av?.shirtColorId
          ? (SHIRT_COLOR_MAP[av.shirtColorId]?.color ?? shirtColorFromUsername(username))
          : shirtColorFromUsername(username);
        return (
          <RemotePlayer
            key={userId}
            username={username}
            position={displayPosition(position)}
            color={skinColor}
            shirtColor={shirtColor}
            glassesId={av?.glassesId ?? 'none'}
            hatId={av?.hatId ?? 'none'}
            bobOffset={bobOffsetFromUsername(username)}
            rotationY={position.rotationY}
            speaking={speakingUserIds.has(String(userId))}
          />
        );
      })}
    </>
  );
}
