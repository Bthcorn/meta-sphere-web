import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind utilities (last wins)', () => {
    // twMerge resolves p-2 vs p-4 — last one wins
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles conditional class objects', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles mixed inputs: strings, objects, and arrays', () => {
    const result = cn('base', { active: true, disabled: false }, ['extra']);
    expect(result).toBe('base active extra');
  });
});
