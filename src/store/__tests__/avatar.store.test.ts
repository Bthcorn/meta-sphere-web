import { describe, it, expect, beforeEach } from 'vitest';
import {
  useAvatarStore,
  SKIN_OPTIONS,
  GLASSES_OPTIONS,
  HAT_OPTIONS,
  SHIRT_COLOR_OPTIONS,
  SKIN_MAP,
  SHIRT_COLOR_MAP,
  GLASSES_MAP,
  HAT_MAP,
} from '../avatar.store';

describe('useAvatarStore', () => {
  beforeEach(() => {
    useAvatarStore.setState({
      avatarId: null,
      glassesId: 'none',
      hatId: 'none',
      shirtColorId: 'slate',
    });
  });

  describe('setAvatar', () => {
    it('updates avatarId', () => {
      useAvatarStore.getState().setAvatar('fair');
      expect(useAvatarStore.getState().avatarId).toBe('fair');
    });
  });

  describe('setGlasses', () => {
    it('updates glassesId', () => {
      useAvatarStore.getState().setGlasses('round');
      expect(useAvatarStore.getState().glassesId).toBe('round');
    });
  });

  describe('setHat', () => {
    it('updates hatId', () => {
      useAvatarStore.getState().setHat('beanie');
      expect(useAvatarStore.getState().hatId).toBe('beanie');
    });
  });

  describe('setShirtColor', () => {
    it('updates shirtColorId', () => {
      useAvatarStore.getState().setShirtColor('teal');
      expect(useAvatarStore.getState().shirtColorId).toBe('teal');
    });
  });

  describe('clearAvatar', () => {
    it('resets all fields to defaults', () => {
      useAvatarStore.getState().setAvatar('deep');
      useAvatarStore.getState().setGlasses('sunglasses');
      useAvatarStore.getState().setHat('tophat');
      useAvatarStore.getState().setShirtColor('forest');

      useAvatarStore.getState().clearAvatar();

      const s = useAvatarStore.getState();
      expect(s.avatarId).toBeNull();
      expect(s.glassesId).toBe('none');
      expect(s.hatId).toBe('none');
      expect(s.shirtColorId).toBe('slate');
    });
  });
});

// ── Static option arrays & maps ────────────────────────────────────────────

describe('Avatar option arrays', () => {
  it('SKIN_OPTIONS has 6 entries', () => {
    expect(SKIN_OPTIONS).toHaveLength(6);
  });

  it('GLASSES_OPTIONS includes a "none" option', () => {
    expect(GLASSES_OPTIONS.some((o) => o.id === 'none')).toBe(true);
  });

  it('HAT_OPTIONS includes a "none" option', () => {
    expect(HAT_OPTIONS.some((o) => o.id === 'none')).toBe(true);
  });

  it('SHIRT_COLOR_OPTIONS has 6 entries', () => {
    expect(SHIRT_COLOR_OPTIONS).toHaveLength(6);
  });
});

describe('Lookup maps', () => {
  it('SKIN_MAP contains all SKIN_OPTIONS ids', () => {
    SKIN_OPTIONS.forEach((o) => {
      expect(SKIN_MAP[o.id]).toEqual(o);
    });
  });

  it('SHIRT_COLOR_MAP contains all SHIRT_COLOR_OPTIONS ids', () => {
    SHIRT_COLOR_OPTIONS.forEach((o) => {
      expect(SHIRT_COLOR_MAP[o.id]).toEqual(o);
    });
  });

  it('GLASSES_MAP contains all GLASSES_OPTIONS ids', () => {
    GLASSES_OPTIONS.forEach((o) => {
      expect(GLASSES_MAP[o.id]).toEqual(o);
    });
  });

  it('HAT_MAP contains all HAT_OPTIONS ids', () => {
    HAT_OPTIONS.forEach((o) => {
      expect(HAT_MAP[o.id]).toEqual(o);
    });
  });
});
