import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  KeyboardControls,
  useKeyboardControls,
  PerspectiveCamera,
  PointerLockControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useAuthStore } from '@/store/auth.store';
import { PlayerAvatar } from '@/components/avatar/player-avatar';
import { AVATAR_OPTIONS, useAvatarStore } from '@/store/avatar.store';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
];

type PlayerProps = {
  position?: [number, number, number];
  lockEnabled?: boolean;
};

/** Matches ~2u Rapier capsule (halfHeight 0.5, radius 0.5); feet near y = -1 in body space. */
const LOCAL_AVATAR_SCALE = 1.45;
const LOCAL_AVATAR_Y_OFFSET = -0.275;

function PlayerMesh({ position = [-22.5, 5, 15], lockEnabled = true }: PlayerProps) {
  const rbRef = useRef<RapierRigidBody>(null);
  const avatarOrientationRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls();
  const username = useAuthStore((s) => s.user?.username ?? 'Player');
  const avatarColorId = useAvatarStore((s) => s.avatarId);
  const skinTint =
    avatarColorId != null ? AVATAR_OPTIONS.find((o) => o.id === avatarColorId)?.color : undefined;

  // Pre-allocated per-instance temporaries to avoid GC pressure each frame
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const euler = new THREE.Euler();
  const viewDirRef = useRef(new THREE.Vector3());
  const worldQuatRef = useRef(new THREE.Quaternion());
  const rotationYRef = useRef(0);

  useFrame((state) => {
    // Camera yaw comes from PointerLockControls; avatar is a sibling, so match yaw here.
    // PlayerAvatar faces +Z; camera looks down -Z — atan2 aligns model forward with view on XZ.
    const viewDir = viewDirRef.current;
    if (avatarOrientationRef.current) {
      state.camera.getWorldDirection(viewDir);
      viewDir.y = 0;
      if (viewDir.lengthSq() > 1e-8) {
        viewDir.normalize();
        const ry = Math.atan2(viewDir.x, viewDir.z);
        avatarOrientationRef.current.rotation.y = ry;
        rotationYRef.current = ry;
      }
    }

    if (!rbRef.current) return;

    // When a panel is open (chat, whiteboard, zone), keyboard input belongs to the UI —
    // halt the player so WASD keystrokes don't drive movement while the user is typing.
    if (!lockEnabled) {
      const linvel = rbRef.current.linvel();
      rbRef.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
      return;
    }

    const { forward, backward, left, right } = getKeys();
    const speed = 8;

    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    direction.subVectors(frontVector, sideVector);

    // Only normalize and apply camera rotation when actually moving to prevent NaN.
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(speed);

      // Extract ONLY the Y-axis rotation (yaw) from the camera world quaternion.
      // Using getWorldQuaternion ensures correctness even if parent transform rotates.
      // This stops you from driving yourself into the ground if you look at the floor.
      state.camera.getWorldQuaternion(worldQuatRef.current);
      euler.setFromQuaternion(worldQuatRef.current, 'YXZ');
      direction.applyEuler(new THREE.Euler(0, euler.y, 0));
    } else {
      direction.set(0, 0, 0);
    }

    const linvel = rbRef.current.linvel();

    rbRef.current.setLinvel(
      {
        x: direction.x,
        y: linvel.y,
        z: direction.z,
      },
      true
    );

    const t = rbRef.current.translation();
    useSpacePresenceStore
      .getState()
      .updatePosition({ x: t.x, y: t.y, z: t.z, rotationY: rotationYRef.current });
  });

  return (
    <RigidBody
      ref={rbRef}
      position={position}
      colliders={false}
      type='dynamic'
      enabledRotations={[false, false, false]}
      friction={0}
      restitution={0}
      canSleep={false}
    >
      <CapsuleCollider args={[0.5, 0.5]} />

      <group>
        <PerspectiveCamera makeDefault position={[0, 0.75, 0]} fov={60} near={0.6} />
        <PointerLockControls enabled={lockEnabled} />
      </group>
      <group
        ref={avatarOrientationRef}
        position={[0, LOCAL_AVATAR_Y_OFFSET, 0]}
        scale={LOCAL_AVATAR_SCALE}
      >
        <PlayerAvatar username={username} color={skinTint} showLabel={false} enableBob={false} />
      </group>
    </RigidBody>
  );
}

export function Player({ position, lockEnabled }: PlayerProps) {
  return (
    <KeyboardControls map={keyboardMap}>
      <PlayerMesh position={position} lockEnabled={lockEnabled} />
    </KeyboardControls>
  );
}
