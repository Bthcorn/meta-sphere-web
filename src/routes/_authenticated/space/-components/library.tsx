import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Library({ width, depth, ...props }: RoomProps) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1.5} color='white'>
        Library
      </Text>

      <RigidBody type='fixed'>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#eab308' />
        </mesh>
      </RigidBody>
    </group>
  );
}
