// ── Stable hash ──────────────────────────────────────────────────────────────

/** Stable integer hash of any string. Uses Math.imul for consistent 32-bit
 *  multiply across all JS engines. Always returns a non-negative number. */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Palettes ─────────────────────────────────────────────────────────────────

/** Human skin tones — fair → light → medium → tan → brown → deep */
export const SKIN_PALETTE = [
  '#f5cba7', // fair / peach
  '#e8a87c', // light beige
  '#d4895a', // medium tan
  '#b8694a', // warm brown
  '#8d4a30', // deep brown
  '#5c2e1a', // very deep
];

/** Shirt colors — subtle, muted tones paired with skin palette entries */
export const SHIRT_PALETTE = [
  '#6b7280', // slate grey
  '#4b6bab', // denim blue
  '#4a7c59', // forest green
  '#7c5c3e', // earthy brown
  '#6d5a8a', // muted purple
  '#3d6b6e', // teal
];

// ── Color derivation ─────────────────────────────────────────────────────────

/** Deterministically pick a skin tone from the palette based on username. */
export function colorFromUsername(name: string): string {
  return SKIN_PALETTE[hashString(name) % SKIN_PALETTE.length];
}

/** Paired shirt color for a given username. */
export function shirtColorFromUsername(name: string): string {
  return SHIRT_PALETTE[hashString(name + '\0') % SHIRT_PALETTE.length];
}

/** Deterministic bob-animation phase offset (0–2π) for a given username. */
export function bobOffsetFromUsername(name: string): number {
  return ((hashString(name) % 100) / 100) * Math.PI * 2;
}
