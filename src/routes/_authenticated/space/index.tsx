import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useSpaceEntry } from '@/hooks/useSpaceEntry';
import { Canvas } from '@react-three/fiber';
// Removed OrbitControls from import!
import { Sky } from '@react-three/drei';

import { Spawn } from './-components/spawn';
import { Meeting } from './-components/meeting';
import { Lecture } from './-components/lecture';
import { Library } from './-components/library';
import { Chilling } from './-components/chilling';
import { Private } from './-components/private';

import { Player } from '@/components/space/Player';
import { RemoteAvatars } from '@/components/users/RemoteAvatars';
import { Crosshair } from '@/components/space/Crosshair';

export const Route = createFileRoute('/_authenticated/space/')({
  component: SpaceIndex,
});

function SpaceIndex() {
  const user = useAuthStore((s) => s.user);

  useSpaceEntry();

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
      {/* Removed the camera prop here, the Player camera handles it now */}
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 20]} intensity={1} />
        <Sky sunPosition={[100, 20, 100]} />

        {/* OrbitControls has been deleted! */}

        <group>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[100, 0.1, 100]} />
            <meshStandardMaterial color='#e5e7eb' />
          </mesh>
          <mesh position={[0, 5, -50]}>
            <boxGeometry args={[100, 10, 1]} />
            <meshStandardMaterial color='#9ca3af' />
          </mesh>
        </group>

        <Spawn position={[0, 0, 40]} />
        <Library position={[-30, 0, 0]} />
        <Lecture position={[30, 0, 0]} />
        <Meeting position={[-30, 0, -30]} />
        <Private position={[30, 0, -30]} />
        <Chilling position={[0, 0, -20]} />

        <RemoteAvatars />
        <Player />
      </Canvas>
    </div>
  );
}
