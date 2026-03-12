import type { ThreeElements } from '@react-three/fiber';

export function Screen(props: ThreeElements['group']) {
  return (
    <group {...props}>
      {/* Outer TV Bezel / Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color='#1f2937' roughness={0.8} />
      </mesh>

      {/* The glowing display screen */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[5.8, 3.3, 0.05]} />
        {/* emissive gives it that backlit monitor look */}
        <meshStandardMaterial
          color='#000000'
          roughness={0.2}
          metalness={0.8}
          emissive='#0284c7'
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}
