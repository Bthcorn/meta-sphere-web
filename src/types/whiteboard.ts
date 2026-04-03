export type StrokeType = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'arrow';

export interface Stroke {
  id: string;
  type: StrokeType;
  points: number[]; // flat [x0,y0,x1,y1,...]
  color: string;
  width: number;
  userId: string;
  timestamp: number;
}

export interface RemoteCursor {
  userId: string;
  username: string;
  x: number;
  y: number;
}

/** In-progress stroke being drawn by a remote user (not yet committed). */
export interface LiveStroke {
  userId: string;
  type: StrokeType;
  points: number[];
  color: string;
  width: number;
}

/** A remote user who is currently drawing. */
export interface DrawingUser {
  userId: string;
  username: string;
}
