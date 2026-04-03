import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Private({ width, depth, ...props }: RoomProps) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1} color='white'>
        Private Room
      </Text>

      <RigidBody type='fixed'>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#ef4444' />
        </mesh>
      </RigidBody>
    </group>
  );
}
