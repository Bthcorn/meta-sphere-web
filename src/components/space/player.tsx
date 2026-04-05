import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  KeyboardControls,
  useKeyboardControls,
  PerspectiveCamera,
  PointerLockControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { PlayerAvatar } from '@/components/avatar/player-avatar';
import { SKIN_MAP, SHIRT_COLOR_MAP, useAvatarStore } from '@/store/avatar.store';

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

/**
 * Thin wrapper around drei's PointerLockControls that exits pointer lock
 * on unmount before the canvas element is removed from the DOM.
 * Without this, the browser throws WrongDocumentError when the document
 * click handler (added by drei) fires requestPointerLock() on a stale,
 * already-removed canvas element.
 */
function SafePointerLockControls() {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      // Release pointer lock synchronously so that by the time React removes
      // the canvas element from the DOM, no pointer-lock request is pending.
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [gl]);

  return <PointerLockControls />;
}

/** Matches ~2u Rapier capsule (halfHeight 0.5, radius 0.5); feet near y = -1 in body space. */
const LOCAL_AVATAR_SCALE = 1.45;
const LOCAL_AVATAR_Y_OFFSET = -0.275;

function PlayerMesh({ position = [-22.5, 5, 15], lockEnabled = true }: PlayerProps) {
  const rbRef = useRef<RapierRigidBody>(null);
  const avatarOrientationRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls();
  const username = useAuthStore((s) => s.user?.username ?? 'Player');
  const avatarColorId = useAvatarStore((s) => s.avatarId);
  const shirtColorId = useAvatarStore((s) => s.shirtColorId);
  const glassesId = useAvatarStore((s) => s.glassesId);
  const hatId = useAvatarStore((s) => s.hatId);
  const skinTint = avatarColorId != null ? SKIN_MAP[avatarColorId]?.color : undefined;
  const shirtColor = SHIRT_COLOR_MAP[shirtColorId]?.color;
  const currentZoneConfig = useSessionStore((s) => s.currentZoneConfig);

  // Release mouse when a zone panel opens and keep it free while the panel is visible.
  useEffect(() => {
    if (currentZoneConfig) {
      document.exitPointerLock();
    }
  }, [currentZoneConfig]);

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

    // When a panel is open (chat, zone panel) halt the player so WASD doesn't
    // drive movement while the user is reading / interacting with the UI.
    if (!lockEnabled || currentZoneConfig) {
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
    useSpacePresenceStore.getState().updatePosition({
      x: t.x,
      y: t.y,
      z: t.z,
      rotationY: rotationYRef.current,
      avatar: {
        skinColor: skinTint,
        shirtColorId,
        glassesId,
        hatId,
      },
    });
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
        {/* Unmount PointerLockControls while a zone panel is open so clicking
            the canvas doesn't accidentally re-lock the mouse. */}
        {!currentZoneConfig && lockEnabled && <SafePointerLockControls />}
      </group>
      <group
        ref={avatarOrientationRef}
        position={[0, LOCAL_AVATAR_Y_OFFSET, 0]}
        scale={LOCAL_AVATAR_SCALE}
      >
        <PlayerAvatar
          username={username}
          color={skinTint}
          shirtColor={shirtColor}
          glassesId={glassesId}
          hatId={hatId}
          showLabel={false}
          enableBob={false}
        />
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
