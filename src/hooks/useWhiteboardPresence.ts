import { useEffect } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useWhiteboardStore } from '@/store/whiteboard.store';

/**
 * Subscribes the socket to the session's whiteboard room and tracks who is
 * drawing — regardless of whether the whiteboard panel is open.
 *
 * This enables the WhiteboardToggle badge to appear even when the panel is
 * closed, because the drawing:true/false events always reach this client.
 */
export function useWhiteboardPresence(sessionId: string) {
  useEffect(() => {
    if (!sessionId) return;
    const socket = socketManager.instance;
    if (!socket) return;

    const onDrawing = ({
      userId,
      username,
      isDrawing,
    }: {
      userId: string;
      username: string;
      isDrawing: boolean;
    }) => {
      if (isDrawing) {
        useWhiteboardStore.getState().setDrawingUser({ userId, username });
      } else {
        useWhiteboardStore.getState().clearDrawingUser(userId);
      }
    };

    socket.on('whiteboard:drawing', onDrawing);

    // Must be in the server room to receive broadcasts
    const joinRoom = () => socket.emit('whiteboard:join', { sessionId });
    if (socket.connected) joinRoom();
    socket.on('connect', joinRoom);

    return () => {
      socket.off('whiteboard:drawing', onDrawing);
      socket.off('connect', joinRoom);
      useWhiteboardStore.getState().clearLiveStrokes();
    };
  }, [sessionId]);
}
