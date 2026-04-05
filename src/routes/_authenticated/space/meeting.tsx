import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/session.store';
import { useSessionFilesStore } from '@/store/session-files.store';
import { useSession } from '@/hooks/useSession';
import { useSpaceEntry } from '@/hooks/useSpaceEntry';
import { MeetingRoomScene } from './-components/meeting-room-scene';
import { SessionHUD } from '@/components/space/session-hud';
import { VoiceBar } from '@/components/space/voice/voice-bar';
import { ChatToggle } from '@/components/space/chat/chat-toggle';
import { ChatPanel } from '@/components/space/chat/chat-panel';
import { Crosshair } from '@/components/space/crosshair';
import { PresenceDebug } from './-components/presence-debug';
import { WhiteboardPanel } from '@/components/whiteboard/whiteboard-panel';
import { WhiteboardToggle } from '@/components/whiteboard/whiteboard-toggle';
import { useWhiteboardPresence } from '@/hooks/useWhiteboardPresence';
import { FileTray } from '@/components/session/file-tray';
import { useSessionInvites } from '@/hooks/useSessionInvites';
import { useFriendRequestsRealtimeSync } from '@/hooks/useFriendRequestsRealtimeSync';
import { FriendRequestToast } from '@/components/friend/friend-request-toast';

export const Route = createFileRoute('/_authenticated/space/meeting')({
  component: MeetingPage,
});

function MeetingPage() {
  const navigate = useNavigate();
  const activeSession = useSessionStore((s) => s.activeSession);
  const trayOpen = useSessionFilesStore((s) => s.trayOpen);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // Clear stale zone/tray on mount; restore area on unmount.
  useEffect(() => {
    useSessionStore.getState().exitZone();
    useSessionFilesStore.getState().closeTray();
    return () => {
      useSessionStore.getState().exitArea();
    };
  }, []);

  useSession();
  useSpaceEntry();
  useWhiteboardPresence(activeSession?.id ?? '');

  useSessionInvites();
  useFriendRequestsRealtimeSync();

  // Redirect to /space when session ends or a SOCIAL session lands here.
  useEffect(() => {
    if (!activeSession || activeSession.type === 'SOCIAL') {
      navigate({ to: '/space' });
    }
  }, [activeSession, navigate]);

  // Exit pointer lock when any panel opens
  useEffect(() => {
    if (chatOpen || whiteboardOpen || trayOpen) document.exitPointerLock();
  }, [chatOpen, whiteboardOpen, trayOpen]);

  // Guard: if pointer lock is somehow re-acquired while a panel is open, release it immediately
  useEffect(() => {
    if (!chatOpen && !whiteboardOpen && !trayOpen) return;
    const onLockChange = () => {
      if (document.pointerLockElement) document.exitPointerLock();
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [chatOpen, whiteboardOpen, trayOpen]);

  if (!activeSession) return null;

  return (
    <div className='w-screen h-screen bg-black'>
      {/* Session info bar at the top */}
      <SessionHUD />

      {/* Chat */}
      <ChatToggle
        open={chatOpen}
        onToggle={() => {
          setChatOpen((o) => !o);
          setWhiteboardOpen(false);
        }}
      />
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      {/* Whiteboard */}
      <WhiteboardToggle
        open={whiteboardOpen}
        onToggle={() => {
          setWhiteboardOpen((o) => !o);
          setChatOpen(false);
        }}
      />
      {whiteboardOpen && <WhiteboardPanel onClose={() => setWhiteboardOpen(false)} />}

      {/* Voice controls at the bottom */}
      <VoiceBar />

      {/* File tray — bottom right, left of whiteboard/chat toggles */}
      <FileTray sessionId={activeSession.id} />

      <FriendRequestToast />

      <Crosshair />

      {import.meta.env.DEV && <PresenceDebug />}

      {/* 3-D meeting room — fills the whole viewport */}
      <MeetingRoomScene lockEnabled={!whiteboardOpen && !chatOpen && !trayOpen} />
    </div>
  );
}
