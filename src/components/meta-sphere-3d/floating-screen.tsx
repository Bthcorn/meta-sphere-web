import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type ScreenConfig, PRIMARY, SCREEN_GLOW } from './constants';

export function FloatingScreen({ angle, radius, height }: ScreenConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const baseHeight = height;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const rotY = Math.atan2(-x, -z); // face toward origin

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseHeight + Math.sin(clock.elapsedTime * 0.6 + angle) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[x, height, z]} rotation={[0, rotY, 0]}>
      {/* Glow backing */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.0, 0.65]} />
        <meshBasicMaterial color={PRIMARY} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Screen surface */}
      <mesh>
        <planeGeometry args={[0.88, 0.55]} />
        <meshStandardMaterial
          color={SCREEN_GLOW}
          emissive={SCREEN_GLOW}
          emissiveIntensity={0.45}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
