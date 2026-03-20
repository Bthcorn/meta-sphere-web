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

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
];

type PlayerProps = {
  position?: [number, number, number];
};

function PlayerMesh({ position = [-22.5, 5, 15] }: PlayerProps) {
  const rbRef = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();

  // Create vectors outside the loop to prevent memory leaks
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const euler = new THREE.Euler();

  useFrame((state) => {
    if (!rbRef.current) return;

    const { forward, backward, left, right } = getKeys();
    const speed = 8;

    frontVector.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    direction.subVectors(frontVector, sideVector);

    // CRITICAL FIX: Only normalize and apply camera rotation if we are actually trying to move!
    // This entirely prevents the NaN crash that freezes your character on the floor.
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(speed);

      // Extract ONLY the Y-axis rotation (yaw) from the camera.
      // This stops you from driving yourself into the ground if you look at the floor.
      euler.setFromQuaternion(state.camera.quaternion, 'YXZ');
      direction.applyEuler(new THREE.Euler(0, euler.y, 0));
    } else {
      // If no keys are pressed, force the vector safely to zero
      direction.set(0, 0, 0);
    }

    const linvel = rbRef.current.linvel();

    // Apply the velocity securely
    rbRef.current.setLinvel(
      {
        x: direction.x,
        y: linvel.y, // Always keep the physics engine's gravity intact
        z: direction.z,
      },
      true
    );
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

      <mesh>
        <PerspectiveCamera makeDefault position={[0, 0.8, 0]} fov={60} near={0.6} />
        <PointerLockControls />
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color='#ec4899' />
      </mesh>
    </RigidBody>
  );
}

export function Player({ position }: PlayerProps) {
  return (
    <KeyboardControls map={keyboardMap}>
      <PlayerMesh position={position} />
    </KeyboardControls>
  );
}
