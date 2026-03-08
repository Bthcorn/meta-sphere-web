export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface UserStatePayload {
  userId: string;
  position: Position;
}
