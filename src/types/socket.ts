export interface AvatarAppearance {
  skinColor?: string;
  shirtColorId?: string;
  glassesId?: string;
  hatId?: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
  /** Y-axis rotation (yaw) in radians — the direction the avatar is facing. */
  rotationY?: number;
  /** Grouped avatar appearance — piggybacked from update_position payload. */
  avatar?: AvatarAppearance;
}

/** Matches `RealtimeGateway` / `docs/REALTIME_SPEC.md`. */
export interface UserStatePayload {
  userId: string;
  username: string;
  roomId: string;
  position: Position;
}

/** Normalize server payloads (snake_case keys, numeric ids). */
export function parseUserStatePayload(raw: unknown): UserStatePayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = o.userId ?? o.user_id;
  if (id === undefined || id === null) return null;
  const username = o.username != null ? String(o.username) : String(id);
  const roomRaw = o.roomId ?? o.room_id;
  const roomId = roomRaw !== undefined && roomRaw !== null ? String(roomRaw) : 'common_area';
  const pos = o.position;
  if (!pos || typeof pos !== 'object') return null;
  const p = pos as Record<string, unknown>;
  const x = Number(p.x);
  const y = Number(p.y);
  const z = Number(p.z);
  if (![x, y, z].every(Number.isFinite)) return null;
  const rotationYRaw = p.rotationY ?? p.rotation_y;
  const rotationY =
    rotationYRaw !== undefined && rotationYRaw !== null && Number.isFinite(Number(rotationYRaw))
      ? Number(rotationYRaw)
      : undefined;

  let avatar: AvatarAppearance | undefined;
  if (p.avatar && typeof p.avatar === 'object') {
    const a = p.avatar as Record<string, unknown>;
    avatar = {
      skinColor: typeof a.skinColor === 'string' ? a.skinColor : undefined,
      shirtColorId: typeof a.shirtColorId === 'string' ? a.shirtColorId : undefined,
      glassesId: typeof a.glassesId === 'string' ? a.glassesId : undefined,
      hatId: typeof a.hatId === 'string' ? a.hatId : undefined,
    };
  }

  return { userId: String(id), username, roomId, position: { x, y, z, rotationY, avatar } };
}
