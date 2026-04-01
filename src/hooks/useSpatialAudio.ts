import { useEffect, useRef, useCallback } from 'react';
import {
  getSpatialAudioContext,
  getOrCreateSpatialAudioContext,
} from '@/lib/spatial-audio-context';
import { useSpacePresenceStore } from '@/store/space-presence.store';

// ─── Tuning constants ────────────────────────────────────────────────────────
const REF_DISTANCE = 2; // Full volume within 2 world units
const MAX_DISTANCE = 25; // Inaudible beyond 25 world units
const ROLLOFF_FACTOR = 1.8; // How quickly volume falls off

interface AudioNodes {
  source: MediaStreamAudioSourceNode;
  panner: PannerNode;
  gain: GainNode;
}

/** Sets a PannerNode/AudioListener position using the modern or legacy API. */
function setPosition(node: PannerNode | AudioListener, x: number, y: number, z: number) {
  if ('positionX' in node && node.positionX) {
    // Modern AudioParam API — sample-accurate, no clicks
    node.positionX.value = x;
    node.positionY.value = y;
    node.positionZ.value = z;
  } else {
    // Legacy Safari / old Chromium
    (node as PannerNode).setPosition?.(x, y, z);
  }
}

export function useSpatialAudio() {
  const audioNodes = useRef<Map<string, AudioNodes>>(new Map());
  const rafRef = useRef<number>(0);

  // ─── Add a peer stream ───────────────────────────────────────────────────
  const addStream = useCallback((userId: string, audioEl: HTMLAudioElement) => {
    // Remove stale nodes for this peer (e.g. reconnect)
    removeStreamById(userId, audioNodes.current);

    const ctx = getOrCreateSpatialAudioContext();

    // Use createMediaStreamSource (not createMediaElementSource) so we read
    // directly from the raw MediaStream. LiveKit sets muted=true on the
    // <audio> element to satisfy browser autoplay policy; createMediaElementSource
    // on a muted element silently delivers no audio in some Chrome versions.
    // createMediaStreamSource bypasses the element's muted/volume state entirely.
    const stream = audioEl.srcObject as MediaStream;
    const source = ctx.createMediaStreamSource(stream);
    const panner = ctx.createPanner();
    const gain = ctx.createGain();

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = REF_DISTANCE;
    panner.maxDistance = MAX_DISTANCE;
    panner.rolloffFactor = ROLLOFF_FACTOR;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0;

    gain.gain.value = 1;

    // MediaStream → PannerNode → GainNode → speakers
    source.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);

    audioNodes.current.set(userId, { source, panner, gain });
  }, []);

  // ─── Remove a peer stream ────────────────────────────────────────────────
  const removeStream = useCallback((userId: string) => {
    removeStreamById(userId, audioNodes.current);
  }, []);

  // ─── Per-peer volume control (0–1) ───────────────────────────────────────
  const setPeerVolume = useCallback((userId: string, volume: number) => {
    const nodes = audioNodes.current.get(userId);
    if (nodes) nodes.gain.gain.value = Math.max(0, Math.min(1, volume));
  }, []);

  // ─── Resume AudioContext on user gesture if it was suspended ────────────
  // The context is created lazily in addStream, so we don't need to create
  // it here — just resume it if a gesture arrives after it already exists.
  useEffect(() => {
    // Create the AudioContext eagerly on the first user gesture so it starts
    // in the running state. Calling getOrCreate (instead of just resume) here
    // guarantees the context exists and is running before any tracks arrive —
    // browsers will reject resume() on a context that was created outside a
    // gesture, but creating it *inside* a gesture sidesteps that restriction.
    const unlock = () => getOrCreateSpatialAudioContext();
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  // ─── Position update loop ────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const ctx = getSpatialAudioContext();
      // Skip position updates until the AudioContext has been created by a
      // user gesture — calling getOrCreate here would trigger the warning.
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const { users, lastPosition } = useSpacePresenceStore.getState();

      // Move the listener to the local player's position
      if (lastPosition) {
        const { x, y, z } = lastPosition;
        setPosition(ctx.listener, x, y, z);

        // Point the listener in the direction the player is facing.
        // rotationY is the yaw stored by the presence store.
        const ry = (lastPosition as { rotationY?: number }).rotationY ?? 0;
        if (ctx.listener.forwardX) {
          // Modern API
          ctx.listener.forwardX.value = Math.sin(ry);
          ctx.listener.forwardY.value = 0;
          ctx.listener.forwardZ.value = Math.cos(ry);
          ctx.listener.upX.value = 0;
          ctx.listener.upY.value = 1;
          ctx.listener.upZ.value = 0;
        } else {
          ctx.listener.setOrientation?.(Math.sin(ry), 0, Math.cos(ry), 0, 1, 0);
        }
      }

      // Move each panner to its peer's world position
      for (const [userId, nodes] of audioNodes.current) {
        const user = users[userId];
        if (!user) continue;
        const { x, y, z } = user.position;
        setPosition(nodes.panner, x, y, z);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    const nodes = audioNodes.current;
    return () => {
      for (const [userId] of nodes) {
        removeStreamById(userId, nodes);
      }
    };
  }, []);

  return {
    addStream,
    removeStream,
    setPeerVolume,
  };
}

// ─── Internal helper ─────────────────────────────────────────────────────────
function removeStreamById(userId: string, map: Map<string, AudioNodes>) {
  const nodes = map.get(userId);
  if (!nodes) return;
  try {
    nodes.source.disconnect();
    nodes.panner.disconnect();
    nodes.gain.disconnect();
  } catch {
    // Already disconnected — safe to ignore
  }
  map.delete(userId);
}
