import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { useSpaceEntry } from '@/hooks/useSpaceEntry';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Spawn } from './-components/spawn';
import { Meeting } from './-components/meeting';
import { Lecture } from './-components/lecture';
import { Library } from './-components/library';
import { Chilling } from './-components/chilling';
import { Private } from './-components/private';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { DEFAULT_SPAWN } from '@/components/meta-sphere-3d/constants';
import { decodeJwtSub } from '@/lib/jwt';
import { Crosshair } from '@/components/space/crosshair';

function PresenceDebug() {
  const users = useSpacePresenceStore((s) => s.users);
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user?.id);
  const list = Object.values(users);
  const selfId = decodeJwtSub(token) ?? (me != null ? String(me) : '');
  const self = list.find((u) => String(u.userId) === selfId);
  return (
    <div className='pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs font-mono text-[11px] text-white/55'>
      <div>Presence: {list.length} in snapshot</div>
      <div>Your id (JWT sub): {selfId || '—'}</div>
      <div>Your room: {self?.roomId ?? '—'}</div>
      <p className='mt-1 leading-snug opacity-90'>
        Others only appear if their socket is in the same room (e.g. both in{' '}
        <code className='text-white/70'>common_area</code>, or the same session).
      </p>
    </div>
  );
}

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

  useSpaceEntry();

  return (
    <div className='w-screen h-screen bg-black'>
      <div className='absolute top-4 left-4 z-10 flex flex-col gap-3 text-white'>
        <Link
          to='/'
          className='inline-flex w-fit items-center rounded-md border border-white/20 bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 pointer-events-auto'
        >
          Home
        </Link>
        <div className='pointer-events-none'>
          <h1 className='text-2xl font-bold drop-shadow-md'>Metasphere Campus</h1>
          <p>Use W, A, S, D to move your player!</p>
        </div>
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
          <Player position={DEFAULT_SPAWN} />

          <RemotePlayers />
        </Physics>
      </Canvas>
      {import.meta.env.DEV && <PresenceDebug />}
    </div>
  );
}
