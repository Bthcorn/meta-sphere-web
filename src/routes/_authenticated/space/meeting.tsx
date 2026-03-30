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

export const Route = createFileRoute('/_authenticated/space/meeting')({
  component: MeetingPage,
});

function MeetingPage() {
  const navigate = useNavigate();
  const activeSession = useSessionStore((s) => s.activeSession);
  const [chatOpen, setChatOpen] = useState(false);

  // Keep participants fresh
  useSession();
  // Re-attach socket presence listeners (same as the main space page)
  useSpaceEntry();

  // Go back to campus when the session ends or user leaves
  useEffect(() => {
    if (!activeSession) {
      navigate({ to: '/space' });
    }
  }, [activeSession, navigate]);

  useEffect(() => {
    if (chatOpen) document.exitPointerLock();
  }, [chatOpen]);

  if (!activeSession) return null;

  return (
    <div className='w-screen h-screen bg-black'>
      {/* Session info bar at the top */}
      <SessionHUD />

      {/* Chat */}
      <ChatToggle open={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      {/* Voice controls at the bottom */}
      <VoiceBar />

      <Crosshair />

      {import.meta.env.DEV && <PresenceDebug />}

      {/* 3-D meeting room — fills the whole viewport */}
      <MeetingRoomScene />
    </div>
  );
}
