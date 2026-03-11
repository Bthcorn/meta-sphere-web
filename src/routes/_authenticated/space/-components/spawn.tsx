import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Spawn({ width, depth, ...props }: RoomProps) {
  return (
    <group {...props}>
      {/* Moved Text OUTSIDE the RigidBody so it has no collision */}
      <Text position={[0, 2, 0]} fontSize={1.5} color='white'>
        Spawn Point
      </Text>

      <RigidBody type='fixed'>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#22c55e' />
        </mesh>
      </RigidBody>
    </group>
  );
}
