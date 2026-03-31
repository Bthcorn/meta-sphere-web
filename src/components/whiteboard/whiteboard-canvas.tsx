import { useRef, useEffect, useCallback } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';
import type { Stroke, LiveStroke } from '@/types/whiteboard';

interface Props {
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  emitStroke: (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => void;
  emitCursor: (x: number, y: number) => void;
  emitDrawing: (isDrawing: boolean) => void;
  emitLiveStroke: (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => void;
}

function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke | LiveStroke) {
  if (stroke.points.length < 4) return;
  ctx.beginPath();
  ctx.globalCompositeOperation = stroke.type === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(stroke.points[0], stroke.points[1]);
  for (let i = 2; i < stroke.points.length; i += 2) {
    ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
  }
  ctx.stroke();
}

export function WhiteboardCanvas({
  tool,
  color,
  width,
  emitStroke,
  emitCursor,
  emitDrawing,
  emitLiveStroke,
}: Props) {
  // Four canvas layers: grid / committed strokes / remote live previews / local live preview
  const gridRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const remoteLiveRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<number[]>([]);

  const strokes = useWhiteboardStore((s) => s.strokes);
  const liveStrokes = useWhiteboardStore((s) => s.liveStrokes);
  const selfId = useAuthStore((s) => s.user?.id);

  // ── Draw dot grid once ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = gridRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    const gap = 24;
    for (let x = gap; x < canvas.width; x += gap) {
      for (let y = gap; y < canvas.height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  // ── Re-render committed strokes ────────────────────────────────────────
  useEffect(() => {
    const canvas = drawRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((s) => renderStroke(ctx, s));
  }, [strokes]);

  // ── Re-render remote live strokes ──────────────────────────────────────
  useEffect(() => {
    const canvas = remoteLiveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(liveStrokes).forEach((s) => {
      if (String(s.userId) === String(selfId)) return;
      renderStroke(ctx, s);
    });
  }, [liveStrokes, selfId]);

  // ── Emit drawing:false on unmount (panel closed mid-stroke) ───────────
  useEffect(() => {
    return () => {
      emitDrawing(false);
      useWhiteboardStore.getState().clearLiveStrokes();
    };
  }, [emitDrawing]);

  // ── Pointer handlers ───────────────────────────────────────────────────
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = previewRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (previewRef.current!.width / rect.width),
      y: (e.clientY - rect.top) * (previewRef.current!.height / rect.height),
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true;
      previewRef.current?.setPointerCapture(e.pointerId);
      const { x, y } = getPos(e);
      currentPointsRef.current = [x, y];
      emitDrawing(true);
    },
    [emitDrawing]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = getPos(e);
      emitCursor(x, y);

      if (!isDrawingRef.current) return;
      currentPointsRef.current.push(x, y);

      // Local live preview
      const canvas = previewRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = currentPointsRef.current;
      if (pts.length < 4) return;
      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(255,255,255,0.4)' : color;
      ctx.lineWidth = tool === 'eraser' ? width * 2 : width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(pts[i], pts[i + 1]);
      }
      ctx.stroke();

      // Broadcast live stroke to others
      emitLiveStroke({ type: tool, points: [...pts], color, width });
    },
    [tool, color, width, emitCursor, emitLiveStroke]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const pts = currentPointsRef.current;
    if (pts.length >= 4) {
      emitStroke({ type: tool, points: pts, color, width });
    }

    // Clear local live preview
    const canvas = previewRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    currentPointsRef.current = [];
    emitDrawing(false);
  }, [tool, color, width, emitStroke, emitDrawing]);

  const canvasProps = {
    width: 1200,
    height: 800,
    style: { position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%' },
  };

  return (
    <div className='relative w-full h-full'>
      <canvas ref={gridRef} {...canvasProps} />
      <canvas ref={drawRef} {...canvasProps} />
      <canvas ref={remoteLiveRef} {...canvasProps} />
      <canvas
        ref={previewRef}
        {...canvasProps}
        style={{ ...canvasProps.style, cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
