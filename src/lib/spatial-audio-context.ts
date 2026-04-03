import { Howler } from 'howler';

let sharedCtx: AudioContext | null = null;

/**
 * Creates the AudioContext on first call. Must only be called from within
 * a user-gesture handler or from code that runs as a result of one
 * (e.g. attaching a remote audio track after the user joined a session).
 * Browsers block AudioContext creation outside of a gesture.
 */
export function getOrCreateSpatialAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
    // Keep Howler in sync so ambient sounds share the same graph.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Howler as any).ctx = sharedCtx;
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

/**
 * Returns the existing AudioContext, or null if it has not been created yet.
 * Safe to call anywhere — will never trigger the browser autoplay warning.
 */
export function getSpatialAudioContext(): AudioContext | null {
  return sharedCtx;
}

/**
 * Resume the AudioContext if it already exists and is suspended.
 * Call from any click/keydown handler to satisfy browser autoplay policy.
 */
export function resumeSpatialAudioContext(): void {
  if (sharedCtx && sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
}

/**
 * Creates (if needed) and awaits resume of the AudioContext.
 * Use this before setting up audio nodes to guarantee the context is running.
 */
export async function ensureSpatialAudioContextRunning(): Promise<AudioContext> {
  const ctx = getOrCreateSpatialAudioContext();
  if (ctx.state !== 'running') {
    await ctx.resume();
  }
  return ctx;
}
