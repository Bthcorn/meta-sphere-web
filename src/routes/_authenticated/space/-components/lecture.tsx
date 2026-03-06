import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function Lecture(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <Text position={[0, 3, 0]} fontSize={2} color='white'>
        Lecture Hall
      </Text>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[20, 0.1, 15]} />
        <meshStandardMaterial color='#8b5cf6' />
      </mesh>
    </group>
  );
}
