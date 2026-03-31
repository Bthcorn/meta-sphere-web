import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/session.store';
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

export const Route = createFileRoute('/_authenticated/space/meeting')({
  component: MeetingPage,
});

function MeetingPage() {
  const navigate = useNavigate();
  const activeSession = useSessionStore((s) => s.activeSession);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // Keep participants fresh
  useSession();
  // Re-attach socket presence listeners (same as the main space page)
  useSpaceEntry();
  // Subscribe to whiteboard room so drawing indicators work even when panel is closed
  useWhiteboardPresence(activeSession?.id ?? '');

  // Go back to campus when the session ends or user leaves
  useEffect(() => {
    if (!activeSession) {
      navigate({ to: '/space' });
    }
  }, [activeSession, navigate]);

  // Exit pointer lock when any panel opens
  useEffect(() => {
    if (chatOpen || whiteboardOpen) document.exitPointerLock();
  }, [chatOpen, whiteboardOpen]);

  // Guard: if pointer lock is somehow re-acquired while a panel is open, release it immediately
  useEffect(() => {
    if (!chatOpen && !whiteboardOpen) return;
    const onLockChange = () => {
      if (document.pointerLockElement) document.exitPointerLock();
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [chatOpen, whiteboardOpen]);

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

      <Crosshair />

      {import.meta.env.DEV && <PresenceDebug />}

      {/* 3-D meeting room — fills the whole viewport */}
      <MeetingRoomScene lockEnabled={!whiteboardOpen && !chatOpen} />
    </div>
  );
}
