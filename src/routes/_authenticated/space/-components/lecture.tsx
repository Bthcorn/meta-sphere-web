import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Lecture({ width, depth, ...props }: RoomProps) {
  return (
    <group {...props}>
      <Text position={[0, 3, 0]} fontSize={2} color='white'>
        Lecture Hall
      </Text>

      <RigidBody type='fixed'>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#8b5cf6' />
        </mesh>
      </RigidBody>
    </group>
  );
}
