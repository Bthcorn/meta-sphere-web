import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type AvatarConfig } from './constants';
import { PlayerAvatar } from '@/components/avatar/player-avatar';

/**
 * Lobby / preview avatar — wraps PlayerAvatar with the existing hover-rotation
 * and bobbing behaviour used in the MetaSphere 3D landing scene.
 */
export function Avatar({ position, color, bobOffset, rotationY, username = '' }: AvatarConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;
    // Smooth rotation toward hover target
    const targetY = hovered ? rotationY + 0.3 : rotationY;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
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
      <PlayerAvatar username={username} color={color} showLabel={false} bobOffset={bobOffset} />
    </group>
  );
}
