import { create } from 'zustand';
import type { Stroke, RemoteCursor, LiveStroke, DrawingUser } from '@/types/whiteboard';

interface WhiteboardState {
  strokes: Stroke[];
  remoteCursors: Record<string, RemoteCursor>;
  // tracks only the current user's strokeIds for undo
  localStack: string[];
  // remote users currently drawing (keyed by userId)
  drawingUsers: Record<string, DrawingUser>;
  // in-progress strokes from remote users (keyed by userId)
  liveStrokes: Record<string, LiveStroke>;

  addStroke: (stroke: Stroke) => void;
  removeStroke: (strokeId: string) => void;
  loadReplay: (strokes: Stroke[]) => void;
  clearAll: () => void;
  pushLocalStack: (strokeId: string) => void;
  popLocalStack: () => string | undefined;
  updateCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  setDrawingUser: (user: DrawingUser) => void;
  clearDrawingUser: (userId: string) => void;
  setLiveStroke: (stroke: LiveStroke) => void;
  clearLiveStroke: (userId: string) => void;
  clearLiveStrokes: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>()((set, get) => ({
  strokes: [],
  remoteCursors: {},
  localStack: [],
  drawingUsers: {},
  liveStrokes: {},

  addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),

  removeStroke: (strokeId) => set((s) => ({ strokes: s.strokes.filter((x) => x.id !== strokeId) })),

  loadReplay: (strokes) => set({ strokes, localStack: [] }),

  clearAll: () => set({ strokes: [], localStack: [] }),

  pushLocalStack: (strokeId) => set((s) => ({ localStack: [...s.localStack, strokeId] })),

  popLocalStack: () => {
    const stack = get().localStack;
    if (stack.length === 0) return undefined;
    const id = stack[stack.length - 1];
    set((s) => ({ localStack: s.localStack.slice(0, -1) }));
    return id;
  },

  updateCursor: (cursor) =>
    set((s) => ({
      remoteCursors: { ...s.remoteCursors, [cursor.userId]: cursor },
    })),

  removeCursor: (userId) =>
    set((s) => {
      const remoteCursors = { ...s.remoteCursors };
      delete remoteCursors[userId];
      return { remoteCursors };
    }),

  setDrawingUser: (user) =>
    set((s) => ({
      drawingUsers: { ...s.drawingUsers, [user.userId]: user },
    })),

  clearDrawingUser: (userId) =>
    set((s) => {
      const drawingUsers = { ...s.drawingUsers };
      const liveStrokes = { ...s.liveStrokes };
      delete drawingUsers[userId];
      delete liveStrokes[userId];
      return { drawingUsers, liveStrokes };
    }),

  setLiveStroke: (stroke) =>
    set((s) => ({
      liveStrokes: { ...s.liveStrokes, [stroke.userId]: stroke },
    })),

  clearLiveStroke: (userId) =>
    set((s) => {
      const liveStrokes = { ...s.liveStrokes };
      delete liveStrokes[userId];
      return { liveStrokes };
    }),

  clearLiveStrokes: () => set({ liveStrokes: {} }),
}));
