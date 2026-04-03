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

interface PeerState {
  userId: string; // LiveKit participant identity = your userId
  username: string; // LiveKit participant name = display name
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

  // ─── Connect to LiveKit room when session becomes active (or lobby) ─────
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const room = new Room({
      // Disable adaptive stream: we route audio through our own Web Audio
      // graph for spatial positioning, so LiveKit must not attach tracks to
      // its own hidden <audio> elements in parallel.
      adaptiveStream: false,
      // Keep dynacast off: with dynacast enabled the encoder pauses when no
      // one is subscribed yet, causing a silent gap for the second person to
      // join since subscription and transmission are not perfectly synchronised.
      dynacast: false,
    });
    roomRef.current = room;

    // ── Event: remote participant starts sending audio ──────────────────
    const onTrackSubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind !== Track.Kind.Audio) return;

      // Create the element ourselves with muted=true BEFORE attach() so the
      // browser's autoplay policy allows the internal play() call that LiveKit
      // makes. Unmuted elements require a prior user gesture; muted ones are
      // always allowed. Our audio graph reads from audioEl.srcObject via
      // createMediaStreamSource, which bypasses the element's muted/volume
      // state entirely, so listeners still hear the remote participant.
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

    // ── Event: remote participant stops sending audio ───────────────────
    const onTrackUnsubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind !== Track.Kind.Audio) return;
      track.detach(); // removes all attached <audio> elements from DOM
      removeStream(participant.identity);
      setPeers((prev) => prev.filter((p) => p.userId !== participant.identity));
    };

    // ── Event: participant leaves ───────────────────────────────────────
    const onParticipantDisconnected = (participant: RemoteParticipant) => {
      removeStream(participant.identity);
      setPeers((prev) => prev.filter((p) => p.userId !== participant.identity));
    };

    // ── Event: speaking indicator ───────────────────────────────────────
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

    // ── Fetch token from backend, then connect ──────────────────────────
    const connect = async () => {
      try {
        // Session voice room when inside a session; area-specific room when
        // standing in a named area (library, chill zone, etc.); global lobby otherwise.
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

        // Guarantee the AudioContext is running before any audio nodes are
        // created. Chrome creates AudioContext in suspended state when outside
        // a direct gesture handler; awaiting resume() here ensures the spatial
        // audio graph works as soon as the first track is subscribed.
        await ensureSpatialAudioContextRunning();

        // Start publishing microphone — must happen before the manual track
        // loop below so that any error in audio-graph setup does not prevent
        // this participant from being able to speak.
        await room.localParticipant.setMicrophoneEnabled(true);

        // After connecting, process any tracks that were already subscribed
        // by participants who joined before us. LiveKit fires TrackSubscribed
        // during the connection handshake, but iterating explicitly here
        // guarantees we never miss a track regardless of event timing.
        // We track processed participant identities to avoid double-processing
        // tracks that the TrackSubscribed event already handled above.
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

    // ── Cleanup on session exit ─────────────────────────────────────────
    return () => {
      cancelled = true;
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.ActiveSpeakersChanged, onActiveSpeakersChanged);

      // Disconnect cleans up all WebRTC internals inside LiveKit
      void room.disconnect();
      roomRef.current = null;
      setPeers([]);
      setConnected(false);
      setError(null);
      setSpeakingUserIds(new Set());
    };
  }, [activeSession?.id ?? null, currentAreaZone?.roomId ?? null, token]); // eslint-disable-line

  // ─── Mute / unmute local mic ────────────────────────────────────────────
  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    // Guaranteed user gesture — unlock the AudioContext if still suspended
    resumeSpatialAudioContext();
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  }, [muted]);

  return { muted, toggleMute, peers, connected, error };
}
