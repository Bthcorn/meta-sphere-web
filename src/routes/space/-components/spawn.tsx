import type { ThreeElements } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export function Spawn(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <Text position={[0, 2, 0]} fontSize={1.5} color="white">
        Spawn Point
      </Text>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[4, 4, 0.1, 32]} />
        <meshStandardMaterial color="#22c55e" /> 
      </mesh>
    </group>
  )
}