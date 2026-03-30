import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
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
import { PresenceDebug } from './-components/presence-debug';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { DEFAULT_SPAWN } from '@/components/meta-sphere-3d/constants';
import { Crosshair } from '@/components/space/crosshair';
import { ZonePanel } from '@/components/space/zone-panel';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/session.store';
import { ChatToggle } from '@/components/space/chat/chat-toggle';
import { ChatPanel } from '@/components/space/chat/chat-panel';

export const Route = createFileRoute('/_authenticated/space/')({
  component: SpaceIndex,
});

function SpaceIndex() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [chatOpen, setChatOpen] = useState(false);
  const { currentZoneConfig, activeSession } = useSessionStore();

  const campusWidth = 40;
  const campusDepth = 30;
  const campusHeight = 7;
  const wallThickness = 1;

  // Navigate to the dedicated meeting page as soon as a session becomes active
  useEffect(() => {
    if (activeSession) {
      navigate({ to: '/space/meeting' });
    }
  }, [activeSession, navigate]);

  useEffect(() => {
    const panelOpen = !!currentZoneConfig || chatOpen;
    if (panelOpen) document.exitPointerLock();
  }, [currentZoneConfig, chatOpen]);

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

      <ZonePanel />

      {/* Chat toggle always visible; panel slides up */}
      <ChatToggle open={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      <Crosshair />
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.info('[WebGL] context restored');
          });
        }}
      >
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

          {/* --- LEFT WING --- */}
          <Meeting position={[-10, 0, -7.5]} width={20} depth={15} />
          <Spawn position={[-10, 0, 3.75]} width={20} depth={7.5} />
          <Chilling position={[-10, 0, 11.25]} width={20} depth={7.5} />

          {/* --- RIGHT WING --- */}
          <Lecture position={[10, 0, -10]} width={20} depth={10} />
          <Library position={[10, 0, 0]} width={20} depth={10} />
          <Private position={[10, 0, 10]} width={20} depth={10} />

          <Player position={DEFAULT_SPAWN} />
          <RemotePlayers />
        </Physics>
      </Canvas>
      {import.meta.env.DEV && <PresenceDebug />}
    </div>
  );
}
