import { useState, useCallback, useEffect } from 'react';
import {
  Track,
  RoomEvent,
  type RemoteTrack,
  type RemoteParticipant,
  type Room,
} from 'livekit-client';
import { useScreenShareStore } from '@/store/screen-share.store';

export function useScreenShare(roomRef: React.RefObject<Room | null>) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setStream, clearStream } = useScreenShareStore();

  // ── Listen for remote screen share tracks ─────────────────────────────
  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;

    const onTrackSubscribed = (track: RemoteTrack, _: unknown, participant: RemoteParticipant) => {
      if (track.source !== Track.Source.ScreenShare) return;
      const stream = new MediaStream([track.mediaStreamTrack]);
      setStream(stream, participant.name ?? participant.identity, false);
    };

    const onTrackUnsubscribed = (track: RemoteTrack) => {
      if (track.source !== Track.Source.ScreenShare) return;
      clearStream();
    };

    const onParticipantLeft = () => {
      clearStream();
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantLeft);

    return () => {
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantLeft);
    };
  }, [roomRef.current]); // eslint-disable-line

  // ── Start sharing ──────────────────────────────────────────────────────
  const startShare = useCallback(
    async (localUsername: string) => {
      const room = roomRef.current;
      if (!room) return;
      try {
        await room.localParticipant.setScreenShareEnabled(true, {
          resolution: { width: 1920, height: 1080, frameRate: 15 },
          audio: true,
        });
        setSharing(true);
        setError(null);

        const screenPub = [...room.localParticipant.trackPublications.values()].find(
          (p) => p.source === Track.Source.ScreenShare
        );

        if (screenPub?.track?.mediaStreamTrack) {
          const stream = new MediaStream([screenPub.track.mediaStreamTrack]);
          setStream(stream, localUsername, true);

          screenPub.track.mediaStreamTrack.addEventListener(
            'ended',
            () => {
              setSharing(false);
              clearStream();
            },
            { once: true }
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'NotAllowedError') {
          setError(err.message);
        }
      }
    },
    [roomRef, setStream, clearStream]
  );

  // ── Stop sharing ───────────────────────────────────────────────────────
  const stopShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setScreenShareEnabled(false);
    setSharing(false);
    clearStream();
  }, [roomRef, clearStream]);

  const toggleShare = useCallback(
    async (localUsername: string) => {
      if (sharing) {
        await stopShare();
      } else {
        await startShare(localUsername);
      }
    },
    [sharing, startShare, stopShare]
  );

  return { sharing, toggleShare, error };
}
