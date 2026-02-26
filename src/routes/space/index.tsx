import { createFileRoute } from '@tanstack/react-router'
import { Canvas } from '@react-three/fiber'
// Removed OrbitControls from import!
import { Sky } from '@react-three/drei'

import { Spawn } from './-components/spawn'
import { Meeting } from './-components/meeting'
import { Lecture } from './-components/lecture'
import { Library } from './-components/library'
import { Chilling } from './-components/chilling'
import { Private } from './-components/private'

import { Player } from '../../components/player'
import { Crosshair } from '../../components/ui/crosshair'

export const Route = createFileRoute('/space/')({
  component: SpaceIndex,
})

function SpaceIndex() {
  return (
    <div className="w-screen h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h1 className="text-2xl font-bold drop-shadow-md">Metasphere Campus</h1>
        <p>Use W, A, S, D to move your player!</p>
      </div>
        <Crosshair />
      {/* Removed the camera prop here, the Player camera handles it now */}
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 20]} intensity={1} />
        <Sky sunPosition={[100, 20, 100]} />
        
        {/* OrbitControls has been deleted! */}

        <group>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[100, 0.1, 100]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <mesh position={[0, 5, -50]}>
            <boxGeometry args={[100, 10, 1]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        </group>

        <Spawn position={[0, 0, 40]} />
        <Library position={[-30, 0, 0]} />
        <Lecture position={[30, 0, 0]} />
        <Meeting position={[-30, 0, -30]} />
        <Private position={[30, 0, -30]} />
        <Chilling position={[0, 0, -20]} />

        <Player />
        
      </Canvas>
    </div>
  )
}