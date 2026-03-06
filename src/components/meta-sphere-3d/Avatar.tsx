import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type AvatarConfig } from './constants';

export function Avatar({ position, color, bobOffset, rotationY }: AvatarConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(clock.elapsedTime * 0.8 + bobOffset) * 0.04;
    }
    if (headRef.current) {
      const mat = headRef.current.material as THREE.MeshStandardMaterial;
      const target = hovered ? 0.9 : 0.3;
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
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
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.13, 0.16, 0.44, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.37, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Hover ring above head */}
      <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.26, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.7 : 0} />
      </mesh>
    </group>
  );
}
