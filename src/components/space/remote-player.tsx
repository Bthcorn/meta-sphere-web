import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useAuthStore } from '@/store/auth.store';
import { useVoiceStore } from '@/store/voice.store';
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
  username: string;
  position: [number, number, number];
  color: string;
  bobOffset: number;
  /** Explicit yaw from backend. undefined = backend doesn't support it; fall back to movement. */
  rotationY: number | undefined;
  speaking: boolean;
};

function RemotePlayer({
  username,
  position,
  color,
  bobOffset,
  rotationY,
  speaking,
}: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Per-instance scratch objects — never share these across instances.
  const tmpVec = useRef(new THREE.Vector3()).current;
  const tmpQuat = useRef(new THREE.Quaternion()).current;
  const tmpEuler = useRef(new THREE.Euler()).current;

  // Last known facing angle in radians (derived from either backend data or movement).
  const faceAngleRef = useRef(rotationY ?? 0);
  // Last reported position for movement-direction derivation.
  const prevPosRef = useRef<[number, number, number]>([...position]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const [px, py, pz] = position;
    const [lpx, , lpz] = prevPosRef.current;

    if (rotationY !== undefined) {
      // Backend relays the real yaw — use it directly.
      faceAngleRef.current = rotationY;
    } else {
      // Backend doesn't send rotation: derive from XZ movement when the avatar moves.
      // Standing still keeps the last known direction.
      const dx = px - lpx;
      const dz = pz - lpz;
      if (dx * dx + dz * dz > 1e-4) {
        faceAngleRef.current = Math.atan2(dx, dz);
      }
    }

    prevPosRef.current = [px, py, pz];

    // Smooth position interpolation — removes teleport jitter from 50 ms updates.
    tmpVec.set(px, py, pz);
    groupRef.current.position.lerp(tmpVec, 1 - Math.exp(-12 * delta));

    // Smooth rotation toward derived/received facing angle.
    tmpEuler.set(0, faceAngleRef.current, 0);
    tmpQuat.setFromEuler(tmpEuler);
    groupRef.current.quaternion.slerp(tmpQuat, 1 - Math.exp(-10 * delta));
  });

  return (
    <group ref={groupRef} position={position}>
      <PlayerAvatar username={username} color={color} bobOffset={bobOffset} speaking={speaking} />
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
