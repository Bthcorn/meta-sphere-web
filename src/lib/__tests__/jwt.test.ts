import { describe, it, expect } from 'vitest';
import { decodeJwtSub } from '../jwt';

/** Build a minimal JWT-shaped string with a given payload. */
function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.fake-sig`;
}

describe('decodeJwtSub', () => {
  it('returns the sub claim as a string', () => {
    expect(decodeJwtSub(makeToken({ sub: 'user-123' }))).toBe('user-123');
  });

  it('converts a numeric sub to string', () => {
    expect(decodeJwtSub(makeToken({ sub: 42 }))).toBe('42');
  });

  it('returns null for null input', () => {
    expect(decodeJwtSub(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(decodeJwtSub(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeJwtSub('')).toBeNull();
  });

  it('returns null when the token has fewer than 3 parts', () => {
    expect(decodeJwtSub('only-one-part')).toBeNull();
    expect(decodeJwtSub('two.parts')).toBeNull();
  });

  it('returns null when the payload is not valid base64', () => {
    expect(decodeJwtSub('header.!!!invalid!!!.sig')).toBeNull();
  });

  it('returns null when the payload has no sub field', () => {
    expect(decodeJwtSub(makeToken({ iat: 1234567890 }))).toBeNull();
  });

  it('returns null when sub is null in the payload', () => {
    expect(decodeJwtSub(makeToken({ sub: null }))).toBeNull();
  });

  it('handles base64url padding correctly (no = chars in token)', () => {
    // The token builder already strips padding — just verify it works
    const token = makeToken({ sub: 'padded-user' });
    expect(token).not.toContain('=');
    expect(decodeJwtSub(token)).toBe('padded-user');
  });
});
