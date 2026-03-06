import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PRIMARY, TABLE_SURFACE } from './constants';

export function WorkTable() {
  const rimRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (rimRef.current) {
      const mat = rimRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Surface */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.07, 48]} />
        <meshStandardMaterial color={TABLE_SURFACE} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Glowing rim */}
      <mesh ref={rimRef} position={[0, 0.34, 0]}>
        <torusGeometry args={[1.6, 0.022, 2, 80]} />
        <meshBasicMaterial color={PRIMARY} transparent opacity={0.5} />
      </mesh>

      {/* Center glow disc */}
      <mesh position={[0, 0.375, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={PRIMARY} transparent opacity={0.12} />
      </mesh>

      {/* Leg */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.18, 0.72, 16]} />
        <meshStandardMaterial color={TABLE_SURFACE} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
