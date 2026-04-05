import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { useSpaceEntry } from '@/hooks/useSpaceEntry';
import { SafeCanvas } from '@/components/space/safe-canvas';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Common } from './-components/common';
import { Meeting } from './-components/meeting';
import { Library } from './-components/library';
import { PresenceDebug } from './-components/presence-debug';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { DEFAULT_SPAWN } from '@/components/meta-sphere-3d/constants';
import { Crosshair } from '@/components/space/crosshair';
import { ZonePanel } from '@/components/space/zone-panel';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/session.store';
import { ZONE_CONFIG } from '@/config/zone-sessions';
import { ChatToggle } from '@/components/space/chat/chat-toggle';
import { ChatPanel } from '@/components/space/chat/chat-panel';
import { VoiceBar } from '@/components/space/voice/voice-bar';
import { useVoice } from '@/hooks/useVoice';
import { BookmarksToggle } from '@/components/library/bookmarks-toggle';
import { BookmarksPanel } from '@/components/library/bookmarks-panel';
import { useBookmarksStore } from '@/store/bookmarks.store';
import { useSessionInvites } from '@/hooks/useSessionInvites';
import { useFriendRequestsRealtimeSync } from '@/hooks/useFriendRequestsRealtimeSync';
import { FriendsToggle } from '@/components/friend/friends-toggle';
import { FriendsPanel } from '@/components/friend/friends-panel';
import { SessionInviteToast } from '@/components/session/session-invite-toast';
import { FriendRequestToast } from '@/components/friend/friend-request-toast';

export const Route = createFileRoute('/_authenticated/space/')({
  component: SpaceIndex,
});

function SpaceIndex() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { muted, toggleMute, peers, connected, error: voiceError } = useVoice();
  const [chatOpen, setChatOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const bookmarksPanelOpen = useBookmarksStore((s) => s.panelOpen);
  const closeBookmarksPanel = useBookmarksStore((s) => s.closePanel);
  const { activeSession, currentAreaZone } = useSessionStore();
  const inLibrary = currentAreaZone?.roomId === ZONE_CONFIG.zone_library.roomId;

  useEffect(() => {
    if (!inLibrary) closeBookmarksPanel();
  }, [inLibrary, closeBookmarksPanel]);

  const campusHeight = 7;

  const colorCommon = '#4b5563'; // Dark Gray
  const colorMeeting = '#EDEADE'; // Alabaster

  // Non-SOCIAL sessions redirect to the meeting page.
  useEffect(() => {
    if (activeSession && activeSession.type !== 'SOCIAL') {
      navigate({ to: '/space/meeting' });
    }
  }, [activeSession, navigate]);

  useEffect(() => {
    if (chatOpen || bookmarksPanelOpen || friendsOpen) document.exitPointerLock();
  }, [chatOpen, bookmarksPanelOpen, friendsOpen]);

  useSpaceEntry();

  useSessionInvites();
  useFriendRequestsRealtimeSync();

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
      <ChatToggle
        open={chatOpen}
        onToggle={() => {
          setChatOpen((o) => !o);
          closeBookmarksPanel();
        }}
      />
      <FriendsToggle
        open={friendsOpen}
        onToggle={() => {
          setFriendsOpen((o) => !o);
          setChatOpen(false);
        }}
      />
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      {inLibrary && <BookmarksToggle className='right-20' />}
      {inLibrary && bookmarksPanelOpen && <BookmarksPanel />}
      {friendsOpen && <FriendsPanel onClose={() => setFriendsOpen(false)} />}

      <SessionInviteToast />
      <FriendRequestToast />

      <VoiceBar
        muted={muted}
        toggleMute={toggleMute}
        peers={peers}
        connected={connected}
        error={voiceError}
      />

      <Crosshair />
      <SafeCanvas shadows dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'default' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 20]} intensity={1} castShadow />
        <Sky sunPosition={[100, 20, 100]} />

        <Physics>
          <RigidBody type='fixed'>
            {/* --- Ceiling sections --- */}

            {/* Meeting Area Roof (Alabaster) */}
            <mesh position={[-10, campusHeight, -8]}>
              <boxGeometry args={[21, 0.1, 16]} />
              <meshStandardMaterial color={colorMeeting} />
            </mesh>

            {/* Common Area Roof (Dark) */}
            <mesh position={[-10, campusHeight, 8]}>
              <boxGeometry args={[21, 0.1, 16]} />
              <meshStandardMaterial color='#1f2937' />
            </mesh>

            {/* Library Area Roof */}
            <mesh position={[10.5, campusHeight, 7.5]}>
              <boxGeometry args={[20, 0.1, 16]} />
              <meshStandardMaterial color='#1f2937' />
            </mesh>

            {/* --- OUTER WALLS --- */}

            {/* LEFT WALL: Common Area (Gray) + Meeting Area ends (Alabaster) */}
            <group>
              <mesh position={[-20.5, campusHeight / 2, 8]}>
                <boxGeometry args={[1, campusHeight, 16]} />
                <meshStandardMaterial color={colorCommon} />
              </mesh>
              <mesh position={[-20.5, campusHeight / 2, -14.25]}>
                <boxGeometry args={[1, campusHeight, 2.5]} />
                <meshStandardMaterial color={colorMeeting} />
              </mesh>
              <mesh position={[-20.5, campusHeight / 2, -0.75]}>
                <boxGeometry args={[1, campusHeight, 2.5]} />
                <meshStandardMaterial color={colorCommon} />
              </mesh>
            </group>

            {/* BACK WALL (Meeting Room portion -> Alabaster) */}
            <mesh position={[-10, campusHeight / 2, -15.5]}>
              <boxGeometry args={[20, campusHeight, 1]} />
              <meshStandardMaterial color={colorMeeting} />
            </mesh>

            {/* DIVIDING WALL (Meeting <-> Common) */}
            <mesh position={[0.5, campusHeight / 2, -1.25]}>
              <boxGeometry args={[1, campusHeight, 2.5]} />
              <meshStandardMaterial color={colorCommon} />
            </mesh>

            <mesh position={[0.5, campusHeight / 2, -7.5]}>
              <boxGeometry args={[1, campusHeight, 4.0]} />
              <meshStandardMaterial color={colorMeeting} />
            </mesh>

            <mesh position={[0.5, campusHeight / 2, -13.75]}>
              <boxGeometry args={[1, campusHeight, 2.5]} />
              <meshStandardMaterial color={colorMeeting} />
            </mesh>

            {/* BACK WALL (Library portion -> Gray) */}
            <mesh position={[10.5, campusHeight / 2, -0.5]}>
              <boxGeometry args={[20, campusHeight, 1]} />
              <meshStandardMaterial color={colorCommon} />
            </mesh>

            {/* RIGHT WALL (Library -> Gray) */}
            <mesh position={[20.5, campusHeight / 2, 7.5]}>
              <boxGeometry args={[1, campusHeight, 16]} />
              <meshStandardMaterial color={colorCommon} />
            </mesh>

            {/* FRONT WALL (Gray) */}
            <mesh position={[0, campusHeight / 2, 15.5]}>
              <boxGeometry args={[42, campusHeight, 1]} />
              <meshStandardMaterial color={colorCommon} />
            </mesh>

            {/* --- INTERNAL PARTITIONS --- */}
            {Array.from({ length: 11 }).map((_, i) => (
              <mesh
                key={`chilling-slat-${i}`}
                position={[0, campusHeight / 2, 7.5 + (i + 1) * 0.65]}
              >
                <boxGeometry args={[0.3, campusHeight, 0.2]} />
                <meshStandardMaterial color='#374151' />
              </mesh>
            ))}

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

          <Meeting position={[-10, 0, -7.5]} width={20} depth={15} />
          <Common position={[-10, 0, 7.5]} width={20} depth={15} />
          <Library position={[10, 0, 7.5]} width={20} depth={15} />

          <Player position={DEFAULT_SPAWN} lockEnabled={!chatOpen && !bookmarksPanelOpen} />
          <RemotePlayers />
        </Physics>
      </SafeCanvas>
      {import.meta.env.DEV && <PresenceDebug />}
    </div>
  );
}
