/** Read `sub` from an access JWT without verifying (must match server `RealtimeGateway`). */
export function decodeJwtSub(token: string | null | undefined): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '===='.slice(0, 4 - pad);
    const json = JSON.parse(atob(b64)) as { sub?: unknown };
    if (json.sub === undefined || json.sub === null) return null;
    return String(json.sub);
  } catch {
    return null;
  }
}
