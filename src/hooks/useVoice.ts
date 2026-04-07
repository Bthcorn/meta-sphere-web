import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  Participant,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
} from 'livekit-client';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { useVoiceStore } from '@/store/voice.store';
import { useSpatialAudio } from '@/hooks/useSpatialAudio';
import {
  resumeSpatialAudioContext,
  ensureSpatialAudioContextRunning,
} from '@/lib/spatial-audio-context';
import { api } from '@/lib/api';

export interface PeerState {
  userId: string;
  username: string;
  speaking: boolean;
}

export function useVoice() {
  const { activeSession, currentAreaZone } = useSessionStore();
  const token = useAuthStore((s) => s.token);

  const [muted, setMuted] = useState(false);
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const { addStream, removeStream } = useSpatialAudio();
  const setSpeakingUserIds = useVoiceStore((s) => s.setSpeakingUserIds);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    // adaptiveStream off: we manage audio routing via our own spatial audio graph.
    // dynacast off: avoids encoder pauses that cause silent gaps for late joiners.
    const room = new Room({ adaptiveStream: false, dynacast: false });
    roomRef.current = room;

    const onTrackSubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind !== Track.Kind.Audio) return;

      // Attach muted so autoplay is allowed; spatial graph reads srcObject directly.
      const audioEl = document.createElement('audio');
      audioEl.muted = true;
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
      track.attach(audioEl);

      addStream(participant.identity, audioEl);

      setPeers((prev) => {
        if (prev.find((p) => p.userId === participant.identity)) return prev;
        return [
          ...prev,
          {
            userId: participant.identity,
            username: participant.name ?? participant.identity,
            speaking: false,
          },
        ];
      });
    };

    const onTrackUnsubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind !== Track.Kind.Audio) return;
      track.detach();
      removeStream(participant.identity);
      setPeers((prev) => prev.filter((p) => p.userId !== participant.identity));
    };

    const onParticipantDisconnected = (participant: RemoteParticipant) => {
      removeStream(participant.identity);
      setPeers((prev) => prev.filter((p) => p.userId !== participant.identity));
    };

    const onActiveSpeakersChanged = (speakers: Participant[]) => {
      const speakerIds = new Set(speakers.map((s) => s.identity));
      setPeers((prev) => prev.map((p) => ({ ...p, speaking: speakerIds.has(p.userId) })));
      setSpeakingUserIds(speakerIds);
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.ActiveSpeakersChanged, onActiveSpeakersChanged);
    room.on(RoomEvent.Connected, () => setConnected(true));
    room.on(RoomEvent.Disconnected, () => setConnected(false));

    const connect = async () => {
      try {
        // Pick token endpoint: session > area > lobby
        const { data } = await (activeSession
          ? api.post<{ token: string; url: string }>(
              `/api/sessions/${activeSession.id}/voice-token`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : currentAreaZone
            ? api.get<{ token: string; url: string }>(
                `/api/voice/area-token?roomId=${currentAreaZone.roomId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
            : api.get<{ token: string; url: string }>('/api/voice/lobby-token', {
                headers: { Authorization: `Bearer ${token}` },
              }));

        if (cancelled) return;

        await room.connect(data.url, data.token);

        if (cancelled) return;

        await ensureSpatialAudioContextRunning();
        await room.localParticipant.setMicrophoneEnabled(true);

        // Catch tracks already published before we connected
        const processedIds = new Set(peers.map((p) => p.userId));
        for (const participant of room.remoteParticipants.values()) {
          if (processedIds.has(participant.identity)) continue;
          for (const publication of participant.trackPublications.values()) {
            if (
              publication.kind === Track.Kind.Audio &&
              publication.isSubscribed &&
              publication.track
            ) {
              onTrackSubscribed(
                publication.track as RemoteTrack,
                publication as RemoteTrackPublication,
                participant
              );
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to connect to voice chat');
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.ActiveSpeakersChanged, onActiveSpeakersChanged);
      void room.disconnect();
      roomRef.current = null;
      setPeers([]);
      setConnected(false);
      setError(null);
      setSpeakingUserIds(new Set());
    };
  }, [activeSession?.id ?? null, currentAreaZone?.roomId ?? null, token]); // eslint-disable-line

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    resumeSpatialAudioContext();
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  }, [muted]);

  return { muted, toggleMute, peers, connected, error, roomRef };
}
