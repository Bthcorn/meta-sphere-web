import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  KeyboardControls, 
  useKeyboardControls, 
  PerspectiveCamera, 
  PointerLockControls 
} from '@react-three/drei'
import * as THREE from 'three'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
]


const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const direction = new THREE.Vector3()

function PlayerMesh() {
  const playerRef = useRef<THREE.Mesh>(null)
  const [, getKeys] = useKeyboardControls()

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys()
    
    if (!forward && !backward && !left && !right) return 

    const speed = 15

    if (playerRef.current) {
      state.camera.getWorldDirection(frontVector)
      frontVector.y = 0 
      frontVector.normalize()

      sideVector.copy(frontVector).cross(state.camera.up).normalize()

      direction.set(0, 0, 0)
      if (forward) direction.add(frontVector)
      if (backward) direction.sub(frontVector)
      if (right) direction.add(sideVector)
      if (left) direction.sub(sideVector)

      if (direction.lengthSq() > 0) {
        direction.normalize().multiplyScalar(speed * delta)
        playerRef.current.position.add(direction)
      }
    }
  })

  return (
    <mesh ref={playerRef} position={[0, 1.5, 40]}>
      <PerspectiveCamera makeDefault position={[0, 0.8, 0]} fov={60} near={0.6} />
      <PointerLockControls />
      <capsuleGeometry args={[0.5, 1, 4, 16]} />
      <meshStandardMaterial color="#ec4899" />
    </mesh>
  )
}

export function Player() {
  return (
    <KeyboardControls map={keyboardMap}>
      <PlayerMesh />
    </KeyboardControls>
  )
}