import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Spawn } from './-components/spawn';
import { Meeting } from './-components/meetingroom/meeting'; // adjust this import if needed based on your folder structure
import { Lecture } from './-components/lecture';
import { Library } from './-components/library';
import { Chilling } from './-components/chilling';
import { Private } from './-components/private';

import { Player } from '../../../components/player';
import { Crosshair } from '../../../components/ui/crosshair';

export const Route = createFileRoute('/_authenticated/space/')({
  component: SpaceIndex,
});

function SpaceIndex() {
  const user = useAuthStore((s) => s.user);

  // 1. Increased campus width to 40 for much more breathing room
  const campusWidth = 40;
  const campusDepth = 30;
  const campusHeight = 7;
  const wallThickness = 1;

  return (
    <div className='w-screen h-screen bg-black'>
      <div className='absolute top-4 left-4 z-10 text-white pointer-events-none'>
        <h1 className='text-2xl font-bold drop-shadow-md'>Metasphere Campus</h1>
        <p>Use W, A, S, D to move your player!</p>
      </div>
      {user && (
        <div className='absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white backdrop-blur-sm pointer-events-none'>
          <div className='h-2 w-2 rounded-full bg-green-400' />
          <span className='text-sm font-medium'>{user.username}</span>
        </div>
      )}
      <Crosshair />
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 20]} intensity={1} />
        <Sky sunPosition={[100, 20, 100]} />

        <Physics>
          {/* --- THE OUTER CAMPUS SHELL --- */}
          <RigidBody type='fixed'>
            <mesh position={[0, campusHeight, 0]}>
              <boxGeometry
                args={[campusWidth + wallThickness * 2, 0.1, campusDepth + wallThickness * 2]}
              />
              <meshStandardMaterial color='#1f2937' />
            </mesh>

            <mesh position={[0, campusHeight / 2, -campusDepth / 2 - wallThickness / 2]}>
              <boxGeometry args={[campusWidth, campusHeight, wallThickness]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>

            <mesh position={[0, campusHeight / 2, campusDepth / 2 + wallThickness / 2]}>
              <boxGeometry args={[campusWidth, campusHeight, wallThickness]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>

            <mesh position={[-campusWidth / 2 - wallThickness / 2, campusHeight / 2, 0]}>
              <boxGeometry args={[wallThickness, campusHeight, campusDepth + wallThickness * 2]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>

            <mesh position={[campusWidth / 2 + wallThickness / 2, campusHeight / 2, 0]}>
              <boxGeometry args={[wallThickness, campusHeight, campusDepth + wallThickness * 2]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
          </RigidBody>

          {/* --- LEFT WING (Now Width 20) --- */}
          {/* X positions shifted to -10 to center them in the new wider left wing */}
          <Meeting position={[-10, 0, -7.5]} width={20} depth={15} />

          <Spawn position={[-10, 0, 3.75]} width={20} depth={7.5} />
          <Chilling position={[-10, 0, 11.25]} width={20} depth={7.5} />

          {/* --- RIGHT WING (Now Width 20) --- */}
          {/* X positions shifted to 10 to center them in the new wider right wing */}
          <Lecture position={[10, 0, -10]} width={20} depth={10} />
          <Library position={[10, 0, 0]} width={20} depth={10} />
          <Private position={[10, 0, 10]} width={20} depth={10} />

          {/* Player spawn shifted left to match the Spawn room's new X position */}
          <Player position={[-10, 3, 3.75]} />
        </Physics>
      </Canvas>
    </div>
  );
}
