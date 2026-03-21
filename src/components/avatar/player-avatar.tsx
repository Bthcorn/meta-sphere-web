import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { colorFromUsername, shirtColorFromUsername } from '@/lib/avatar-utils';

// ── Types ───────────────────────────────────────────────────────────────────
export type PlayerAvatarProps = {
  /** Display name shown above the avatar's head. */
  username: string;
  /** Override the auto-derived color. */
  color?: string;
  /** Whether to render the floating username label. Default: true. */
  showLabel?: boolean;
  /** Static offset added to the group's Y position before bobbing. Default: 0. */
  baseY?: number;
  /** Phase offset for the idle bob animation. Default: 0. */
  bobOffset?: number;
  /** When false, vertical bob is disabled (e.g. Rapier-driven local player). Default: true. */
  enableBob?: boolean;
};

// ── Component ────────────────────────────────────────────────────────────────
export function PlayerAvatar({
  username,
  color,
  showLabel = true,
  baseY = 0,
  bobOffset = 0,
  enableBob = true,
}: PlayerAvatarProps) {
  const skinColor = color ?? colorFromUsername(username);
  const shirtColor = shirtColorFromUsername(username);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (!enableBob) {
      groupRef.current.position.y = baseY;
      return;
    }
    const t = clock.elapsedTime;
    groupRef.current.position.y = baseY + Math.sin(t * 0.9 + bobOffset) * 0.035;
  });

  return (
    <group ref={groupRef}>
      {/* ── Shirt / torso ────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Neck ─────────────────────────────────────────────── */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.14, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} metalness={0} />
      </mesh>

      {/* ── Head ─────────────────────────────────────────────── */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        {/* roughness ~0.75, zero metalness = matte organic skin */}
        <meshStandardMaterial color={skinColor} roughness={0.75} metalness={0} />
      </mesh>

      {/* ── Eyes (white sclera) ───────────────────────────────── */}
      <mesh position={[-0.075, 0.685, 0.175]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshStandardMaterial color='#f5f5f5' roughness={0.2} metalness={0} />
      </mesh>
      <mesh position={[0.075, 0.685, 0.175]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshStandardMaterial color='#f5f5f5' roughness={0.2} metalness={0} />
      </mesh>

      {/* ── Pupils ───────────────────────────────────────────── */}
      <mesh position={[-0.075, 0.685, 0.208]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color='#1a1a1a' roughness={0.1} metalness={0} />
      </mesh>
      <mesh position={[0.075, 0.685, 0.208]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color='#1a1a1a' roughness={0.1} metalness={0} />
      </mesh>

      {/* ── Username label ────────────────────────────────────── */}
      {showLabel && (
        <Html position={[0, 1.08, 0]} center distanceFactor={7} occlude>
          <div
            style={{
              background: 'rgba(10, 8, 24, 0.75)',
              color: '#ffffff',
              padding: '3px 11px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {username}
          </div>
        </Html>
      )}
    </group>
  );
}
