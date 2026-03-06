import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function Chilling(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1.5} color='white'>
        Chilling Zone
      </Text>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[6, 6, 0.1, 32]} />
        <meshStandardMaterial color='#f97316' />
      </mesh>
    </group>
  );
}
