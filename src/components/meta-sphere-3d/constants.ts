export const PRIMARY = '#7c5dfa';
export const ACCENT = '#a78bfa';
export const GLOW = '#c4b5fd';
export const TABLE_SURFACE = '#4a4580';
export const SCREEN_GLOW = '#38bdf8';

// ── Avatars ────────────────────────────────────────────────────────────────

// ── Avatars ────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  position: [number, number, number];
  color: string;
  bobOffset: number;
  rotationY: number;
  /** Passed to PlayerAvatar for shirt color hashing; lobby uses synthetic ids. */
  username?: string;
}

// Lobby decoration avatars use the same skin tones as the live avatars.
const LOBBY_SKIN_TONES = ['#f5cba7', '#e8a87c', '#d4895a', '#b8694a', '#8d4a30'];

const AVATAR_COUNT = 5;
const AVATAR_RADIUS = 1.8;
const AVATAR_Y = 0.9;

export const AVATARS: AvatarConfig[] = Array.from({ length: AVATAR_COUNT }, (_, i) => {
  const angle = (i / AVATAR_COUNT) * Math.PI * 2;
  return {
    position: [Math.cos(angle) * AVATAR_RADIUS, AVATAR_Y, Math.sin(angle) * AVATAR_RADIUS],
    color: LOBBY_SKIN_TONES[i % LOBBY_SKIN_TONES.length],
    bobOffset: (i / AVATAR_COUNT) * Math.PI * 2,
    rotationY: -angle + Math.PI,
    username: `lobby-${i}`,
  };
});

// ── Spawn ──────────────────────────────────────────────────────────────────
/** Default world-space spawn position — used for both the local player and
 *  remote players whose position hasn't been received yet. */
export const DEFAULT_SPAWN: [number, number, number] = [-10, 1, 14];

// ── Screens ────────────────────────────────────────────────────────────────

export interface ScreenConfig {
  angle: number;
  radius: number;
  height: number;
}

export const SCREENS: ScreenConfig[] = [
  { angle: 0.3, radius: 3.0, height: 1.5 },
  { angle: Math.PI * 0.7, radius: 3.0, height: 1.7 },
  { angle: Math.PI * 1.5, radius: 2.8, height: 1.4 },
];
