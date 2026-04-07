/**
 * 3-D avatar accessories — glasses and hats.
 *
 * All Y positions are calibrated for PlayerAvatar whose head center sits at
 * y = 0.65.  The original accessory geometry was built for a preview bot whose
 * head center was at y ≈ 0.38, so every Y coordinate has been shifted +0.27.
 */

import * as THREE from 'three';

// ── Glasses ─────────────────────────────────────────────────────────────────
// Head center y=0.65 → glasses bridge sits at y≈0.69, z=0.23

const GLASSES_Y = 0.69; // was 0.42
const GLASSES_Z = 0.23;

function RoundGlasses({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.055, 0.006, 0.006]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

const SQ_W = 0.038;
const SQ_H = 0.028;
const SQ_T = 0.006;

function SquareLensFrame({ ox, color }: { ox: number; color: string }) {
  return (
    <group position={[ox, GLASSES_Y, GLASSES_Z]}>
      <mesh position={[0, SQ_H, 0]}>
        <boxGeometry args={[SQ_W * 2, SQ_T, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[0, -SQ_H, 0]}>
        <boxGeometry args={[SQ_W * 2, SQ_T, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[-SQ_W, 0, 0]}>
        <boxGeometry args={[SQ_T, SQ_H * 2, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[SQ_W, 0, 0]}>
        <boxGeometry args={[SQ_T, SQ_H * 2, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
    </group>
  );
}

function SquareGlasses({ color }: { color: string }) {
  return (
    <group>
      <SquareLensFrame ox={-0.09} color={color} />
      <SquareLensFrame ox={0.09} color={color} />
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.04, 0.006, 0.006]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Sunglasses({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color='#555' roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <circleGeometry args={[0.034, 20]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color='#555' roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <circleGeometry args={[0.034, 20]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.055, 0.006, 0.006]} />
        <meshStandardMaterial color='#555' metalness={0.8} />
      </mesh>
    </group>
  );
}

export function GlassesAccessory({ id, color }: { id: string; color: string }) {
  if (id === 'round') return <RoundGlasses color={color} />;
  if (id === 'square') return <SquareGlasses color={color} />;
  if (id === 'sunglasses') return <Sunglasses color={color} />;
  return null;
}

// ── Hats ─────────────────────────────────────────────────────────────────────
// Head top ≈ y=0.85 → hats shifted from y≈0.6 to y≈0.87

function Beanie({ color }: { color: string }) {
  return (
    <group position={[0, 0.87, 0]}>
      {/* Main dome */}
      <mesh>
        <sphereGeometry args={[0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Ribbed band */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.06, 24]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Pom pom */}
      <mesh position={[0, 0.17, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color='white' roughness={1} />
      </mesh>
    </group>
  );
}

function Cap({ color }: { color: string }) {
  return (
    <group position={[0, 0.85, 0]}>
      {/* Crown */}
      <mesh>
        <sphereGeometry args={[0.195, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Brim — forward-tilted */}
      <mesh position={[0, -0.04, 0.14]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.025, 24, 1, false, -Math.PI * 0.4, Math.PI * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function TopHat({ color }: { color: string }) {
  return (
    <group position={[0, 0.87, 0]}>
      {/* Crown */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.36, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Brim */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.025, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.163, 0.163, 0.04, 24]} />
        <meshStandardMaterial color='#7c5dfa' roughness={0.4} />
      </mesh>
    </group>
  );
}

export function HatAccessory({ id, color }: { id: string; color: string }) {
  if (id === 'beanie') return <Beanie color={color} />;
  if (id === 'cap') return <Cap color={color} />;
  if (id === 'tophat') return <TopHat color={color} />;
  return null;
}
