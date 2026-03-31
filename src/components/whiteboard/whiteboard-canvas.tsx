import { useRef, useEffect, useCallback } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard.store';
import { useAuthStore } from '@/store/auth.store';
import type { Stroke, LiveStroke, StrokeType } from '@/types/whiteboard';

interface Props {
  tool: StrokeType;
  color: string;
  width: number;
  emitStroke: (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => void;
  emitCursor: (x: number, y: number) => void;
  emitDrawing: (isDrawing: boolean) => void;
  emitLiveStroke: (partial: Pick<Stroke, 'type' | 'points' | 'color' | 'width'>) => void;
}

const SHAPE_TOOLS = new Set<StrokeType>(['rectangle', 'circle', 'line', 'arrow']);

function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke | LiveStroke) {
  if (stroke.points.length < 4) return;

  ctx.globalCompositeOperation = stroke.type === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = stroke.color;

  const [x0, y0, x1, y1] = stroke.points;

  switch (stroke.type) {
    case 'pen':
    case 'eraser': {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 2; i < stroke.points.length; i += 2) {
        ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
      }
      ctx.stroke();
      break;
    }
    case 'rectangle': {
      ctx.beginPath();
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      break;
    }
    case 'circle': {
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      if (rx < 1 || ry < 1) break;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      const headLength = Math.max(12, stroke.width * 4);
      const angle = Math.atan2(y1 - y0, x1 - x0);
      // Stop the line at the arrowhead base so the stroke doesn't poke through the tip
      const baseX = x1 - headLength * Math.cos(angle);
      const baseY = y1 - headLength * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(baseX, baseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(
        x1 - headLength * Math.cos(angle - Math.PI / 6),
        y1 - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x1 - headLength * Math.cos(angle + Math.PI / 6),
        y1 - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
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
  // For pen/eraser: accumulated points. For shapes: [startX, startY].
  const currentPointsRef = useRef<number[]>([]);
  // Tracks last pointer position so pointerUp can finalize shape coordinates.
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // ── Pointer helpers ────────────────────────────────────────────────────
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
      lastPosRef.current = { x, y };
      emitDrawing(true);
    },
    [emitDrawing]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = getPos(e);
      lastPosRef.current = { x, y };
      emitCursor(x, y);

      if (!isDrawingRef.current) return;

      const canvas = previewRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (SHAPE_TOOLS.has(tool)) {
        // Preview: render shape from start to current cursor position
        const [sx, sy] = currentPointsRef.current;
        const pts = [sx, sy, x, y];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderStroke(ctx, { type: tool, points: pts, color, width, userId: '' });
        emitLiveStroke({ type: tool, points: pts, color, width });
      } else {
        // Freehand pen / eraser: accumulate points
        currentPointsRef.current.push(x, y);
        const pts = currentPointsRef.current;
        if (pts.length < 4) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        emitLiveStroke({ type: tool, points: [...pts], color, width });
      }
    },
    [tool, color, width, emitCursor, emitLiveStroke]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = previewRef.current;

    if (SHAPE_TOOLS.has(tool)) {
      const [sx, sy] = currentPointsRef.current;
      const { x: ex, y: ey } = lastPosRef.current;
      const dx = ex - sx;
      const dy = ey - sy;
      // Only commit if the shape has meaningful size
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        emitStroke({ type: tool, points: [sx, sy, ex, ey], color, width });
      }
    } else {
      const pts = currentPointsRef.current;
      if (pts.length >= 4) {
        emitStroke({ type: tool, points: pts, color, width });
      }
    }

    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    currentPointsRef.current = [];
    emitDrawing(false);
  }, [tool, color, width, emitStroke, emitDrawing]);

  const cursor = tool === 'eraser' ? 'cell' : 'crosshair';

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
        style={{ ...canvasProps.style, cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
