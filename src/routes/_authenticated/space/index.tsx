import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useSpaceEntry } from '@/hooks/useSpaceEntry';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Spawn } from './-components/spawn';
import { Meeting } from './-components/meeting';
import { Library } from './-components/library';
import { Chilling } from './-components/chilling';
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

  const campusHeight = 7;

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
      <ChatToggle open={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      <Crosshair />

      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 20]} intensity={1} />
        <Sky sunPosition={[100, 20, 100]} />

        <Physics>
          <RigidBody type='fixed'>
            {/* Ceiling sections */}
            <mesh position={[-10, campusHeight, 0]}>
              <boxGeometry args={[21, 0.1, 32]} />
              <meshStandardMaterial color='#1f2937' />
            </mesh>
            <mesh position={[10.5, campusHeight, 7.5]}>
              <boxGeometry args={[20, 0.1, 16]} />
              <meshStandardMaterial color='#1f2937' />
            </mesh>

            {/* Outer Walls */}
            <mesh position={[-20.5, campusHeight / 2, 0]}>
              <boxGeometry args={[1, campusHeight, 32]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
            <mesh position={[-10, campusHeight / 2, -15.5]}>
              <boxGeometry args={[20, campusHeight, 1]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
            <mesh position={[0.5, campusHeight / 2, -8]}>
              <boxGeometry args={[1, campusHeight, 16]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
            <mesh position={[10.5, campusHeight / 2, -0.5]}>
              <boxGeometry args={[20, campusHeight, 1]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
            <mesh position={[20.5, campusHeight / 2, 7.5]}>
              <boxGeometry args={[1, campusHeight, 16]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>
            <mesh position={[0, campusHeight / 2, 15.5]}>
              <boxGeometry args={[42, campusHeight, 1]} />
              <meshStandardMaterial color='#4b5563' />
            </mesh>

            {/* --- INTERNAL PARTITIONS --- */}

            {/* 1. THE HOLEY WALL (Chilling <-> Library) */}
            {/* Spacing logic: Starts exactly 0.65 units after the Spawn wall ends */}
            {Array.from({ length: 11 }).map((_, i) => (
              <mesh
                key={`chilling-slat-${i}`}
                position={[0, campusHeight / 2, 7.5 + (i + 1) * 0.65]}
              >
                <boxGeometry args={[0.3, campusHeight, 0.2]} />
                <meshStandardMaterial color='#374151' />
              </mesh>
            ))}

            {/* 2. Wall with Doorway (Spawn <-> Library) */}
            <group position={[0, campusHeight / 2, 3.75]}>
              <mesh position={[0, 0, -2.875]}>
                <boxGeometry args={[0.4, campusHeight, 1.75]} />
                <meshStandardMaterial color='#374151' />
              </mesh>
              <mesh position={[0, 0, 2.875]}>
                <boxGeometry args={[0.4, campusHeight, 1.75]} />
                <meshStandardMaterial color='#374151' />
              </mesh>
              <mesh position={[0, campusHeight / 2 - 1, 0]}>
                <boxGeometry args={[0.4, 2, 4]} />
                <meshStandardMaterial color='#374151' />
              </mesh>
            </group>
          </RigidBody>

          {/* --- ROOM COMPONENTS --- */}
          <Meeting position={[-10, 0, -7.5]} width={20} depth={15} />
          <Spawn position={[-10, 0, 3.75]} width={20} depth={7.5} />
          <Chilling position={[-10, 0, 11.25]} width={20} depth={7.5} />
          <Library position={[10, 0, 7.5]} width={20} depth={15} />

          <Player position={DEFAULT_SPAWN} lockEnabled={!chatOpen && !currentZoneConfig} />
          <RemotePlayers />
        </Physics>
      </Canvas>
      {import.meta.env.DEV && <PresenceDebug />}
    </div>
  );
}
