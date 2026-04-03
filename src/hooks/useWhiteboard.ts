import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { socketManager } from '@/lib/socket-manager';
import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';
import type { Stroke, RemoteCursor, LiveStroke } from '@/types/whiteboard';

export function useWhiteboard(sessionId: string) {
  const user = useAuthStore((s) => s.user);
  const cursorThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveStrokeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Register socket listeners + request replay on mount ────────────────
  useEffect(() => {
    const socket = socketManager.instance;
    if (!socket) return;

    // Always call getState() inside handlers to avoid stale closures
    const onInit = ({ strokes }: { strokes: Stroke[] }) => {
      useWhiteboardStore.getState().loadReplay(strokes);
    };
    const onStroke = (stroke: Stroke) => {
      const store = useWhiteboardStore.getState();
      store.addStroke(stroke);
      // Final stroke committed — clear their live preview
      store.clearLiveStroke(stroke.userId);
    };
    const onCursor = (cursor: RemoteCursor) => {
      useWhiteboardStore.getState().updateCursor(cursor);
    };
    const onUndo = ({ strokeId }: { strokeId: string }) => {
      useWhiteboardStore.getState().removeStroke(strokeId);
    };
    const onClear = () => {
      useWhiteboardStore.getState().clearAll();
    };
    const onLiveStroke = ({ stroke }: { stroke: LiveStroke }) => {
      useWhiteboardStore.getState().setLiveStroke(stroke);
    };

    socket.on('whiteboard:init', onInit);
    socket.on('whiteboard:stroke', onStroke);
    socket.on('whiteboard:cursor', onCursor);
    socket.on('whiteboard:undo', onUndo);
    socket.on('whiteboard:clear', onClear);
    socket.on('whiteboard:stroke:live', onLiveStroke);
    // whiteboard:drawing is handled by useWhiteboardPresence (always active in meeting)

    // Note: whiteboard:join is also emitted by useWhiteboardPresence; the server
    // handles duplicate joins idempotently (re-sends history, no side effects).
    const joinRoom = () => socket.emit('whiteboard:join', { sessionId });
    if (socket.connected) joinRoom();
    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('whiteboard:init', onInit);
      socket.off('whiteboard:stroke', onStroke);
      socket.off('whiteboard:cursor', onCursor);
      socket.off('whiteboard:undo', onUndo);
      socket.off('whiteboard:clear', onClear);
      socket.off('whiteboard:stroke:live', onLiveStroke);
    };
  }, [sessionId]);

  // ── Emitters ────────────────────────────────────────────────────────────
  const emitStroke = useCallback(
    (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => {
      if (!user) return;
      const stroke: Stroke = {
        ...partial,
        id: uuid(),
        userId: user.id,
        timestamp: Date.now(),
      };
      const store = useWhiteboardStore.getState();
      store.addStroke(stroke);
      store.pushLocalStack(stroke.id);
      socketManager.emit('whiteboard:stroke', { sessionId, stroke });
    },
    [sessionId, user]
  );

  const emitCursor = useCallback(
    (x: number, y: number) => {
      if (!user || cursorThrottleRef.current) return;
      cursorThrottleRef.current = setTimeout(() => {
        cursorThrottleRef.current = null;
      }, 50);
      socketManager.emit('whiteboard:cursor', {
        sessionId,
        x,
        y,
        userId: user.id,
        username: user.username,
      });
    },
    [sessionId, user]
  );

  const emitDrawing = useCallback(
    (isDrawing: boolean) => {
      if (!user) return;
      socketManager.emit('whiteboard:drawing', {
        sessionId,
        userId: user.id,
        username: user.username,
        isDrawing,
      });
    },
    [sessionId, user]
  );

  const emitLiveStroke = useCallback(
    (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => {
      if (!user || liveStrokeThrottleRef.current) return;
      liveStrokeThrottleRef.current = setTimeout(() => {
        liveStrokeThrottleRef.current = null;
      }, 32); // ~30 fps
      const stroke: LiveStroke = { ...partial, userId: user.id };
      socketManager.emit('whiteboard:stroke:live', { sessionId, stroke });
    },
    [sessionId, user]
  );

  const emitUndo = useCallback(() => {
    const store = useWhiteboardStore.getState();
    const strokeId = store.popLocalStack();
    if (!strokeId) return;
    store.removeStroke(strokeId);
    socketManager.emit('whiteboard:undo', { sessionId, strokeId });
  }, [sessionId]);

  const emitClear = useCallback(() => {
    useWhiteboardStore.getState().clearAll();
    socketManager.emit('whiteboard:clear', { sessionId });
  }, [sessionId]);

  return { emitStroke, emitCursor, emitDrawing, emitLiveStroke, emitUndo, emitClear };
}
