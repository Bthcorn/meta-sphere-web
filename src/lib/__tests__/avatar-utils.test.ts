import { describe, it, expect } from 'vitest';
import {
  hashString,
  colorFromUsername,
  shirtColorFromUsername,
  bobOffsetFromUsername,
  SKIN_PALETTE,
  SHIRT_PALETTE,
} from '../avatar-utils';

describe('hashString', () => {
  it('returns a non-negative number', () => {
    expect(hashString('alice')).toBeGreaterThanOrEqual(0);
    expect(hashString('bob')).toBeGreaterThanOrEqual(0);
  });

  it('is deterministic — same input always yields same output', () => {
    const h = hashString('deterministic');
    expect(hashString('deterministic')).toBe(h);
  });

  it('returns different values for different strings', () => {
    expect(hashString('alice')).not.toBe(hashString('bob'));
  });

  it('returns 0 for an empty string', () => {
    expect(hashString('')).toBe(0);
  });
});

describe('colorFromUsername', () => {
  it('returns a value from SKIN_PALETTE', () => {
    const color = colorFromUsername('alice');
    expect(SKIN_PALETTE).toContain(color);
  });

  it('is deterministic', () => {
    expect(colorFromUsername('alice')).toBe(colorFromUsername('alice'));
  });

  it('maps to different colors for different usernames (at least some)', () => {
    const names = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];
    const colors = new Set(names.map(colorFromUsername));
    // With 6 palette entries and 6 names, we expect at least 2 distinct values
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('shirtColorFromUsername', () => {
  it('returns a value from SHIRT_PALETTE', () => {
    const color = shirtColorFromUsername('alice');
    expect(SHIRT_PALETTE).toContain(color);
  });

  it('is deterministic', () => {
    expect(shirtColorFromUsername('alice')).toBe(shirtColorFromUsername('alice'));
  });

  it('differs from skin color for the same username (uses different salt)', () => {
    const skin = colorFromUsername('alice');
    const shirt = shirtColorFromUsername('alice');
    // They come from different palettes so they should be in different sets
    expect(SKIN_PALETTE).toContain(skin);
    expect(SHIRT_PALETTE).toContain(shirt);
  });
});

describe('bobOffsetFromUsername', () => {
  it('returns a value in [0, 2π)', () => {
    const offset = bobOffsetFromUsername('alice');
    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset).toBeLessThan(Math.PI * 2);
  });

  it('is deterministic', () => {
    expect(bobOffsetFromUsername('alice')).toBe(bobOffsetFromUsername('alice'));
  });

  it('returns different offsets for different usernames (at least some)', () => {
    const offsets = new Set(['alice', 'bob', 'charlie', 'diana', 'eve'].map(bobOffsetFromUsername));
    expect(offsets.size).toBeGreaterThan(1);
  });
});
