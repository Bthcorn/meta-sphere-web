import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarOption {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'violet', name: 'Violet', color: '#7c5dfa', description: 'Bold and creative' },
  { id: 'cyan', name: 'Cyan', color: '#22d3ee', description: 'Clear and focused' },
  { id: 'emerald', name: 'Emerald', color: '#34d399', description: 'Calm and reliable' },
  { id: 'rose', name: 'Rose', color: '#fb7185', description: 'Energetic and warm' },
  { id: 'amber', name: 'Amber', color: '#fbbf24', description: 'Optimistic and bright' },
  { id: 'indigo', name: 'Indigo', color: '#818cf8', description: 'Thoughtful and deep' },
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

interface AvatarState {
  avatarId: string | null;
  glassesId: string;
  hatId: string;
  setAvatar: (id: string) => void;
  setGlasses: (id: string) => void;
  setHat: (id: string) => void;
  clearAvatar: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      avatarId: null,
      glassesId: 'none',
      hatId: 'none',
      setAvatar: (id) => set({ avatarId: id }),
      setGlasses: (id) => set({ glassesId: id }),
      setHat: (id) => set({ hatId: id }),
      clearAvatar: () => set({ avatarId: null, glassesId: 'none', hatId: 'none' }),
    }),
    { name: 'avatar' }
  )
);
