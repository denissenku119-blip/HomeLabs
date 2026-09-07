import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface CanvasToolbarProps {
  scale: number;
  showGrid: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  onToggleGrid: () => void;
}

export function CanvasToolbar({
  scale,
  showGrid,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  onToggleGrid,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 rounded-lg bg-base-850/90 border border-base-700 backdrop-blur-sm shadow-elevated">
      <ToolbarButton onClick={onZoomOut} label="Zoom out" disabled={scale <= 0.3}>
        <ZoomOut className="w-4 h-4" />
      </ToolbarButton>
      <span className="px-1.5 text-2xs font-mono text-base-300 min-w-[36px] text-center">
        {Math.round(scale * 100)}%
      </span>
      <ToolbarButton onClick={onZoomIn} label="Zoom in" disabled={scale >= 2}>
        <ZoomIn className="w-4 h-4" />
      </ToolbarButton>
      <div className="w-px h-5 bg-base-700 mx-0.5" />
      <ToolbarButton onClick={onFit} label="Fit to view">
        <Maximize2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onReset} label="Reset view">
        <RotateCcw className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onToggleGrid} label="Toggle grid" active={showGrid}>
        <Grid3x3 className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Tooltip content={label} side="bottom">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          active
            ? 'bg-accent/15 text-accent'
            : 'text-base-300 hover:text-base-100 hover:bg-base-700'
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}
