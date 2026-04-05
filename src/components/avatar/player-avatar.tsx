import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { colorFromUsername, shirtColorFromUsername } from '@/lib/avatar-utils';
import { GLASSES_MAP, HAT_MAP } from '@/store/avatar.store';
import { GlassesAccessory, HatAccessory } from './accessories';

// ── Types ───────────────────────────────────────────────────────────────────
export type PlayerAvatarProps = {
  /** Display name shown above the avatar's head. */
  username: string;
  /** Override the auto-derived skin color. */
  color?: string;
  /** Override the auto-derived shirt color. */
  shirtColor?: string;
  /** Which glasses to render. Default: 'none'. */
  glassesId?: string;
  /** Which hat to render. Default: 'none'. */
  hatId?: string;
  /** Whether to render the floating username label. Default: true. */
  showLabel?: boolean;
  /** Static offset added to the group's Y position before bobbing. Default: 0. */
  baseY?: number;
  /** Phase offset for the idle bob animation. Default: 0. */
  bobOffset?: number;
  /** When false, vertical bob is disabled (e.g. Rapier-driven local player). Default: true. */
  enableBob?: boolean;
  /** When true, renders a speaking indicator on the name tag. Default: false. */
  speaking?: boolean;
};

// ── Component ────────────────────────────────────────────────────────────────
export function PlayerAvatar({
  username,
  color,
  shirtColor: shirtColorProp,
  glassesId = 'none',
  hatId = 'none',
  showLabel = true,
  baseY = 0,
  bobOffset = 0,
  enableBob = true,
  speaking = false,
}: PlayerAvatarProps) {
  const skinColor = color ?? colorFromUsername(username);
  const shirtColor = shirtColorProp ?? shirtColorFromUsername(username);

  const glassesColor = GLASSES_MAP[glassesId]?.color ?? 'transparent';
  const hatColor = HAT_MAP[hatId]?.color ?? 'transparent';

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

      {/* ── Accessories ──────────────────────────────────────── */}
      {glassesId !== 'none' && <GlassesAccessory id={glassesId} color={glassesColor} />}
      {hatId !== 'none' && <HatAccessory id={hatId} color={hatColor} />}

      {/* ── Username label ────────────────────────────────────── */}
      {showLabel && (
        <Html position={[0, 1.35, 0]} center distanceFactor={7} occlude>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: speaking ? 'rgba(22, 101, 52, 0.85)' : 'rgba(10, 8, 24, 0.75)',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
              border: speaking
                ? '1px solid rgba(74, 222, 128, 0.6)'
                : '1px solid rgba(255,255,255,0.15)',
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {speaking && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  height: '10px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      width: '2px',
                      borderRadius: '1px',
                      background: '#4ade80',
                      animation: `voiceBar 0.6s ease-in-out ${i * 0.12}s infinite alternate`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes voiceBar {
                    from { height: 3px; }
                    to   { height: 10px; }
                  }
                `}</style>
              </span>
            )}
            {username}
          </div>
        </Html>
      )}
    </group>
  );
}
