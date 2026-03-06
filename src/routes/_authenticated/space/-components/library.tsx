import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function Library(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1.5} color='white'>
        Library
      </Text>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[15, 0.1, 10]} />
        <meshStandardMaterial color='#eab308' />
      </mesh>
    </group>
  );
}
