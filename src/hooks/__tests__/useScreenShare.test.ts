import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RoomEvent, Track } from 'livekit-client';
import { useScreenShare } from '../useScreenShare';
import { useScreenShareStore } from '@/store/screen-share.store';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('livekit-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('livekit-client')>();
  return { ...actual };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrack(source: Track.Source, kind = Track.Kind.Video) {
  const mediaStreamTrack = { addEventListener: vi.fn(), kind } as unknown as MediaStreamTrack;
  return { source, kind, mediaStreamTrack } as unknown as import('livekit-client').RemoteTrack;
}

function makeParticipant(identity: string, name?: string) {
  return { identity, name } as unknown as import('livekit-client').RemoteParticipant;
}

function makePublication() {
  return {} as unknown as import('livekit-client').RemoteTrackPublication;
}

function makeRoom() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] ??= [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb);
    }),
    emit(event: string, ...args: unknown[]) {
      listeners[event]?.forEach((cb) => cb(...args));
    },
    localParticipant: {
      setScreenShareEnabled: vi.fn().mockResolvedValue(undefined),
      trackPublications: new Map(),
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Proper class constructor — arrow functions cannot be used with `new`
class MockMediaStream {
  tracks: MediaStreamTrack[];
  constructor(tracks: MediaStreamTrack[] = []) {
    this.tracks = tracks;
  }
}

describe('useScreenShare', () => {
  beforeEach(() => {
    useScreenShareStore.getState().clearStream();
    vi.clearAllMocks();
    vi.stubGlobal('MediaStream', MockMediaStream);
  });

  it('starts with sharing=false and no error', () => {
    const roomRef = { current: null };
    const { result } = renderHook(() => useScreenShare(roomRef));
    expect(result.current.sharing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('startShare', () => {
    it('calls setScreenShareEnabled(true) and sets stream in store', async () => {
      const room = makeRoom();
      const track = makeTrack(Track.Source.ScreenShare);
      const pub = {
        source: Track.Source.ScreenShare,
        track,
      } as unknown as import('livekit-client').LocalTrackPublication;
      room.localParticipant.trackPublications.set('screen', pub);

      const roomRef = { current: room as unknown as import('livekit-client').Room };
      const { result } = renderHook(() => useScreenShare(roomRef));

      await act(async () => {
        await result.current.toggleShare('alice');
      });

      expect(room.localParticipant.setScreenShareEnabled).toHaveBeenCalledWith(
        true,
        expect.any(Object)
      );
      expect(result.current.sharing).toBe(true);
      expect(useScreenShareStore.getState().stream).not.toBeNull();
      expect(useScreenShareStore.getState().sharerName).toBe('alice');
      expect(useScreenShareStore.getState().isLocal).toBe(true);
    });

    it('does not set error on NotAllowedError', async () => {
      const room = makeRoom();
      room.localParticipant.setScreenShareEnabled = vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
        );

      const roomRef = { current: room as unknown as import('livekit-client').Room };
      const { result } = renderHook(() => useScreenShare(roomRef));

      await act(async () => {
        await result.current.toggleShare('alice');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.sharing).toBe(false);
    });

    it('sets error for non-NotAllowedError failures', async () => {
      const room = makeRoom();
      room.localParticipant.setScreenShareEnabled = vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('Hardware error'), { name: 'NotReadableError' })
        );

      const roomRef = { current: room as unknown as import('livekit-client').Room };
      const { result } = renderHook(() => useScreenShare(roomRef));

      await act(async () => {
        await result.current.toggleShare('alice');
      });

      expect(result.current.error).toBe('Hardware error');
    });

    it('does nothing when roomRef.current is null', async () => {
      const roomRef = { current: null };
      const { result } = renderHook(() => useScreenShare(roomRef));

      await act(async () => {
        await result.current.toggleShare('alice');
      });

      expect(result.current.sharing).toBe(false);
    });
  });

  describe('stopShare', () => {
    it('calls setScreenShareEnabled(false), clears sharing and store', async () => {
      const room = makeRoom();
      const track = makeTrack(Track.Source.ScreenShare);
      const pub = {
        source: Track.Source.ScreenShare,
        track,
      } as unknown as import('livekit-client').LocalTrackPublication;
      room.localParticipant.trackPublications.set('screen', pub);

      const roomRef = { current: room as unknown as import('livekit-client').Room };
      const { result } = renderHook(() => useScreenShare(roomRef));

      // Start first
      await act(async () => {
        await result.current.toggleShare('alice');
      });
      expect(result.current.sharing).toBe(true);

      // Then stop
      await act(async () => {
        await result.current.toggleShare('alice');
      });

      expect(room.localParticipant.setScreenShareEnabled).toHaveBeenLastCalledWith(false);
      expect(result.current.sharing).toBe(false);
      expect(useScreenShareStore.getState().stream).toBeNull();
    });
  });

  describe('remote track events', () => {
    it('sets store stream when a remote ScreenShare track is subscribed', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      renderHook(() => useScreenShare(roomRef));

      const track = makeTrack(Track.Source.ScreenShare);
      const participant = makeParticipant('bob', 'Bob');

      act(() => {
        room.emit(RoomEvent.TrackSubscribed, track, makePublication(), participant);
      });

      expect(useScreenShareStore.getState().stream).not.toBeNull();
      expect(useScreenShareStore.getState().sharerName).toBe('Bob');
      expect(useScreenShareStore.getState().isLocal).toBe(false);
    });

    it('ignores non-ScreenShare tracks', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      renderHook(() => useScreenShare(roomRef));

      const track = makeTrack(Track.Source.Camera);
      act(() => {
        room.emit(RoomEvent.TrackSubscribed, track, makePublication(), makeParticipant('bob'));
      });

      expect(useScreenShareStore.getState().stream).toBeNull();
    });

    it('clears store stream when a remote ScreenShare track is unsubscribed', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      renderHook(() => useScreenShare(roomRef));

      const track = makeTrack(Track.Source.ScreenShare);
      act(() => {
        room.emit(
          RoomEvent.TrackSubscribed,
          track,
          makePublication(),
          makeParticipant('bob', 'Bob')
        );
      });
      expect(useScreenShareStore.getState().stream).not.toBeNull();

      act(() => {
        room.emit(RoomEvent.TrackUnsubscribed, track, makePublication(), makeParticipant('bob'));
      });
      expect(useScreenShareStore.getState().stream).toBeNull();
    });

    it('clears store stream when the sharing participant disconnects', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      renderHook(() => useScreenShare(roomRef));

      const track = makeTrack(Track.Source.ScreenShare);
      act(() => {
        room.emit(
          RoomEvent.TrackSubscribed,
          track,
          makePublication(),
          makeParticipant('bob', 'Bob')
        );
        room.emit(RoomEvent.ParticipantDisconnected, makeParticipant('bob'));
      });

      expect(useScreenShareStore.getState().stream).toBeNull();
    });

    it('uses participant identity as fallback when name is undefined', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      renderHook(() => useScreenShare(roomRef));

      const track = makeTrack(Track.Source.ScreenShare);
      act(() => {
        room.emit(
          RoomEvent.TrackSubscribed,
          track,
          makePublication(),
          makeParticipant('bob-id', undefined)
        );
      });

      expect(useScreenShareStore.getState().sharerName).toBe('bob-id');
    });

    it('removes event listeners on unmount', () => {
      const room = makeRoom();
      const roomRef = { current: room as unknown as import('livekit-client').Room };
      const { unmount } = renderHook(() => useScreenShare(roomRef));

      unmount();

      expect(room.off).toHaveBeenCalledWith(RoomEvent.TrackSubscribed, expect.any(Function));
      expect(room.off).toHaveBeenCalledWith(RoomEvent.TrackUnsubscribed, expect.any(Function));
      expect(room.off).toHaveBeenCalledWith(
        RoomEvent.ParticipantDisconnected,
        expect.any(Function)
      );
    });
  });
});
