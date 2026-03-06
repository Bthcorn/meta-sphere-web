import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function Private(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1} color='white'>
        Private Room
      </Text>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[5, 0.1, 5]} />
        <meshStandardMaterial color='#ef4444' />
      </mesh>
    </group>
  );
}
