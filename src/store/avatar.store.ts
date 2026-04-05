import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarOption {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const SKIN_OPTIONS: AvatarOption[] = [
  { id: 'fair', name: 'Fair', color: '#f5cba7', description: 'Peach tone' },
  { id: 'light', name: 'Light', color: '#e8a87c', description: 'Light beige' },
  { id: 'tan', name: 'Tan', color: '#d4895a', description: 'Medium tan' },
  { id: 'brown', name: 'Brown', color: '#b8694a', description: 'Warm brown' },
  { id: 'deep', name: 'Deep', color: '#8d4a30', description: 'Deep brown' },
  { id: 'vdeep', name: 'Very deep', color: '#5c2e1a', description: 'Deepest tone' },
];

export interface AccessoryOption {
  id: string;
  name: string;
  color: string;
}

export const GLASSES_OPTIONS: AccessoryOption[] = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'round', name: 'Round', color: '#d1d5db' },
  { id: 'square', name: 'Square', color: '#9ca3af' },
  { id: 'sunglasses', name: 'Shades', color: '#1e1b4b' },
];

export const HAT_OPTIONS: AccessoryOption[] = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'beanie', name: 'Beanie', color: '#dc2626' },
  { id: 'cap', name: 'Cap', color: '#374151' },
  { id: 'tophat', name: 'Top Hat', color: '#1f2937' },
];

export interface ShirtOption {
  id: string;
  name: string;
  color: string;
}

export const SHIRT_COLOR_OPTIONS: ShirtOption[] = [
  { id: 'slate', name: 'Slate', color: '#6b7280' },
  { id: 'denim', name: 'Denim', color: '#4b6bab' },
  { id: 'forest', name: 'Forest', color: '#4a7c59' },
  { id: 'earth', name: 'Earth', color: '#7c5c3e' },
  { id: 'purple', name: 'Purple', color: '#6d5a8a' },
  { id: 'teal', name: 'Teal', color: '#3d6b6e' },
];

// ── O(1) lookup maps ───────────────────────────────────────────────────────
// Prefer these over .find() on the arrays above.

function toMap<T extends { id: string }>(arr: T[]): Readonly<Record<string, T>> {
  return Object.fromEntries(arr.map((o) => [o.id, o]));
}

export const SKIN_MAP: Readonly<Record<string, AvatarOption>> = toMap(SKIN_OPTIONS);
export const SHIRT_COLOR_MAP: Readonly<Record<string, ShirtOption>> = toMap(SHIRT_COLOR_OPTIONS);
export const GLASSES_MAP: Readonly<Record<string, AccessoryOption>> = toMap(GLASSES_OPTIONS);
export const HAT_MAP: Readonly<Record<string, AccessoryOption>> = toMap(HAT_OPTIONS);

interface AvatarState {
  avatarId: string | null;
  glassesId: string;
  hatId: string;
  shirtColorId: string;
  setAvatar: (id: string) => void;
  setGlasses: (id: string) => void;
  setHat: (id: string) => void;
  setShirtColor: (id: string) => void;
  clearAvatar: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      avatarId: null,
      glassesId: 'none',
      hatId: 'none',
      shirtColorId: 'slate',
      setAvatar: (id) => set({ avatarId: id }),
      setGlasses: (id) => set({ glassesId: id }),
      setHat: (id) => set({ hatId: id }),
      setShirtColor: (id) => set({ shirtColorId: id }),
      clearAvatar: () =>
        set({ avatarId: null, glassesId: 'none', hatId: 'none', shirtColorId: 'slate' }),
    }),
    { name: 'avatar' }
  )
);
