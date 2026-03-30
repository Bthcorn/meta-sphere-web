import { useEffect, useRef, useCallback, useState } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useSessionStore } from '@/store/session.store';

interface PeerState {
  userId: string;
  stream: MediaStream;
}

export function useVoice() {
  const { activeSession, participants } = useSessionStore();
  const [muted, setMuted] = useState(false);
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const createPeer = useCallback((targetUserId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Add local tracks
    localStream.current?.getTracks().forEach((track) => pc.addTrack(track, localStream.current!));

    // Forward ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketManager.emit('webrtc:ice-candidate', { targetUserId, candidate });
      }
    };

    // Receive remote audio
    pc.ontrack = ({ streams: [stream] }) => {
      setPeers((prev) => {
        const exists = prev.find((p) => p.userId === targetUserId);
        if (exists) return prev;
        return [...prev, { userId: targetUserId, stream }];
      });
      // Auto-play audio
      let audio = audioRefs.current.get(targetUserId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audioRefs.current.set(targetUserId, audio);
      }
      audio.srcObject = stream;
    };

    peerConnections.current.set(targetUserId, pc);

    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketManager.emit('webrtc:offer', {
            targetUserId,
            sdp: pc.localDescription,
          });
        });
    }

    return pc;
  }, []);

  const closePeer = useCallback((userId: string) => {
    peerConnections.current.get(userId)?.close();
    peerConnections.current.delete(userId);
    audioRefs.current.get(userId)?.remove();
    audioRefs.current.delete(userId);
    setPeers((prev) => prev.filter((p) => p.userId !== userId));
  }, []);

  // Start voice when joining a session
  useEffect(() => {
    if (!activeSession) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStream.current = stream;

        // Initiate connections to all current participants
        participants.forEach((p) => {
          if (p.userId !== activeSession.hostId) {
            createPeer(p.userId, true);
          }
        });
      })
      .catch(() => setError('Microphone permission denied'));

    return () => {
      // Clean up everything on session exit
      peerConnections.current.forEach((_, uid) => closePeer(uid));
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      setPeers([]);
    };
  }, [activeSession?.id]); // eslint-disable-line

  // Socket signal handlers
  useEffect(() => {
    const socket = socketManager.instance;
    if (!socket) return;

    const onOffer = async ({
      fromUserId,
      sdp,
    }: {
      fromUserId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = createPeer(fromUserId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketManager.emit('webrtc:answer', { targetUserId: fromUserId, sdp: pc.localDescription });
    };

    const onAnswer = async ({
      fromUserId,
      sdp,
    }: {
      fromUserId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const onIce = async ({
      fromUserId,
      candidate,
    }: {
      fromUserId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const onUserDisconnected = (userId: string) => closePeer(userId);

    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice-candidate', onIce);
    socket.on('user_disconnected', onUserDisconnected);

    return () => {
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice-candidate', onIce);
      socket.off('user_disconnected', onUserDisconnected);
    };
  }, [createPeer, closePeer]);

  const toggleMute = useCallback(() => {
    if (!localStream.current) return;
    const track = localStream.current.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  }, []);

  return { muted, toggleMute, peers, error };
}
