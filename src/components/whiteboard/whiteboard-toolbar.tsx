import {
  Pencil,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Square,
  Circle,
  Minus,
  MoveRight,
} from 'lucide-react';
import type { StrokeType } from '@/types/whiteboard';

const COLORS = [
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#60a5fa',
  '#c084fc',
  '#f472b6',
];

const WIDTHS = [2, 4, 8, 14];

interface Props {
  tool: StrokeType;
  color: string;
  width: number;
  isHost: boolean;
  canUndo: boolean;
  onToolChange: (t: StrokeType) => void;
  onColorChange: (c: string) => void;
  onWidthChange: (w: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
}

export function WhiteboardToolbar({
  tool,
  color,
  width,
  isHost,
  canUndo,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onClear,
  onExport,
}: Props) {
  return (
    <div
      className='pointer-events-auto flex items-center gap-2 px-3 py-2
                  rounded-xl border border-white/10 bg-black/70 backdrop-blur-md shadow-xl'
    >
      {/* Freehand tools */}
      <ToolBtn active={tool === 'pen'} onClick={() => onToolChange('pen')} title='Pen'>
        <Pencil className='size-4' />
      </ToolBtn>
      <ToolBtn active={tool === 'eraser'} onClick={() => onToolChange('eraser')} title='Eraser'>
        <Eraser className='size-4' />
      </ToolBtn>

      <Divider />

      {/* Shape tools */}
      <ToolBtn
        active={tool === 'rectangle'}
        onClick={() => onToolChange('rectangle')}
        title='Rectangle'
      >
        <Square className='size-4' />
      </ToolBtn>
      <ToolBtn
        active={tool === 'circle'}
        onClick={() => onToolChange('circle')}
        title='Circle / Ellipse'
      >
        <Circle className='size-4' />
      </ToolBtn>
      <ToolBtn active={tool === 'line'} onClick={() => onToolChange('line')} title='Line'>
        <Minus className='size-4' />
      </ToolBtn>
      <ToolBtn active={tool === 'arrow'} onClick={() => onToolChange('arrow')} title='Arrow'>
        <MoveRight className='size-4' />
      </ToolBtn>

      <Divider />

      {/* Color swatches */}
      <div className='flex items-center gap-1'>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className='rounded-full transition-transform hover:scale-110'
            style={{
              backgroundColor: c,
              width: 16,
              height: 16,
              outline: color === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      <Divider />

      {/* Stroke width */}
      <div className='flex items-center gap-1.5'>
        {WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => onWidthChange(w)}
            className={`flex items-center justify-center rounded-full transition-colors
                        ${width === w ? 'bg-white/20' : 'hover:bg-white/10'}`}
            style={{ width: 24, height: 24 }}
            title={`${w}px`}
          >
            <div className='rounded-full bg-white' style={{ width: w + 2, height: w + 2 }} />
          </button>
        ))}
      </div>

      <Divider />

      {/* Actions */}
      <ToolBtn onClick={onUndo} disabled={!canUndo} title='Undo (Ctrl+Z)'>
        <Undo2 className='size-4' />
      </ToolBtn>

      {isHost && (
        <ToolBtn onClick={onClear} title='Clear board' danger>
          <Trash2 className='size-4' />
        </ToolBtn>
      )}

      <ToolBtn onClick={onExport} title='Export as PNG'>
        <Download className='size-4' />
      </ToolBtn>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────

function Divider() {
  return <div className='h-5 w-px bg-white/10 mx-1' />;
}

function ToolBtn({
  children,
  active = false,
  danger = false,
  disabled = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed
                  ${active ? 'bg-white/20 text-white' : ''}
                  ${danger ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/70 hover:text-white'}
                  ${!active && !danger ? 'text-white/70' : ''}`}
    >
      {children}
    </button>
  );
}
