export const PRIMARY = '#7c5dfa';
export const ACCENT = '#a78bfa';
export const GLOW = '#c4b5fd';
export const TABLE_SURFACE = '#4a4580';
export const SCREEN_GLOW = '#38bdf8';

// ── Avatars ────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  position: [number, number, number];
  color: string;
  bobOffset: number;
  rotationY: number;
}

export const AVATAR_COLORS = [PRIMARY, ACCENT, GLOW, '#818cf8', '#6366f1'];
const AVATAR_COUNT = 5;
const AVATAR_RADIUS = 1.8;
const AVATAR_Y = 0.9;

export const AVATARS: AvatarConfig[] = Array.from({ length: AVATAR_COUNT }, (_, i) => {
  const angle = (i / AVATAR_COUNT) * Math.PI * 2;
  return {
    position: [Math.cos(angle) * AVATAR_RADIUS, AVATAR_Y, Math.sin(angle) * AVATAR_RADIUS],
    color: AVATAR_COLORS[i],
    bobOffset: (i / AVATAR_COUNT) * Math.PI * 2,
    rotationY: -angle + Math.PI,
  };
});

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
