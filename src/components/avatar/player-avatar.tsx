import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { UserPlus, Check, Users } from 'lucide-react';
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
  /** Whether this player is already a friend of the viewer. */
  isFriend?: boolean;
  /** Whether the viewer has already sent a friend request to this player. */
  friendRequestSent?: boolean;
  /** Called when the viewer clicks "Add friend". Omit to hide the button. */
  onAddFriend?: () => void;
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
  isFriend = false,
  friendRequestSent = false,
  onAddFriend,
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
        <Html position={[0, 1.35, 0]} center distanceFactor={7} occlude zIndexRange={[100, 0]}>
          <div
            className={`flex max-w-[min(92vw,18rem)] items-center gap-2 rounded-full border px-2.5 py-1
                        text-xs font-semibold tracking-wide shadow-lg backdrop-blur-md
                        ${
                          speaking
                            ? 'border-emerald-400/60 bg-emerald-950/85 text-white'
                            : 'border-white/15 bg-[#0a0818]/75 text-white'
                        }`}
            style={{ pointerEvents: 'auto' }}
          >
            {speaking && (
              <span className='flex h-2.5 items-end gap-px'>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className='block w-0.5 rounded-sm bg-emerald-400'
                    style={{
                      animation: `remoteVoiceBar 0.6s ease-in-out ${i * 0.12}s infinite alternate`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes remoteVoiceBar {
                    from { height: 3px; }
                    to { height: 10px; }
                  }
                `}</style>
              </span>
            )}

            <span className='min-w-0 shrink truncate'>{username}</span>

            {onAddFriend !== undefined && (
              <>
                <span className='h-3 w-px shrink-0 bg-white/20' aria-hidden />
                {isFriend ? (
                  <span className='flex shrink-0 items-center gap-1 text-emerald-400'>
                    <Users className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Friends</span>
                  </span>
                ) : (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!friendRequestSent) onAddFriend();
                    }}
                    disabled={friendRequestSent}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium transition
                                ${
                                  friendRequestSent
                                    ? 'cursor-default bg-green-600/25 text-green-400'
                                    : 'bg-violet-600/90 text-white hover:bg-violet-500 disabled:opacity-50'
                                }`}
                  >
                    {friendRequestSent ? (
                      <>
                        <Check className='h-3 w-3' aria-hidden />
                        <span className='hidden sm:inline'>Sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className='h-3 w-3' />
                        <span className='hidden sm:inline'>Add</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
