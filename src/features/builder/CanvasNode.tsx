import { useRef, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react';
import { Cpu, HardDrive, Network, Zap, Server, Shield, Box, Trash2, Link2, Copy } from 'lucide-react';
import type { ProjectComponent, ComponentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { formatPower, formatStorage, formatCost, formatNetwork } from '@/utils/calculations';

const iconMap: Record<ComponentCategory, React.ElementType> = {
  compute: Cpu,
  storage: HardDrive,
  networking: Network,
  power: Zap,
  virtualization: Server,
  security: Shield,
  other: Box,
};

interface CanvasNodeProps {
  component: ProjectComponent;
  selected: boolean;
  isConnectingFrom: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnecting: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function CanvasNode({
  component,
  selected,
  isConnectingFrom,
  scale,
  onSelect,
  onMove,
  onStartConnecting,
  onDelete,
  onDuplicate,
}: CanvasNodeProps) {
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const Icon = iconMap[component.category] ?? Box;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(component.instanceId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: component.x,
      origY: component.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.startX) / scale;
    const dy = (e.clientY - dragState.current.startY) / scale;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragState.current.moved = true;
    }
    onMove(component.instanceId, dragState.current.origX + dx, dragState.current.origY + dy);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragState.current = null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 20 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onMove(component.instanceId, component.x - step, component.y);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onMove(component.instanceId, component.x + step, component.y);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onMove(component.instanceId, component.x, component.y - step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onMove(component.instanceId, component.x, component.y + step);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete(component.instanceId);
    }
  };

  const badges: { label: string; priority: number }[] = [];
  if (component.ramGB != null && component.ramGB > 0) badges.push({ label: `${component.ramGB}GB`, priority: 1 });
  if (component.networkSpeedGbps > 0) badges.push({ label: formatNetwork(component.networkSpeedGbps), priority: 2 });
  if (component.driveBays != null && component.driveBays > 0) badges.push({ label: `${component.driveBays}-Bay`, priority: 3 });
  if (component.storageTB > 0 && component.driveBays == null) badges.push({ label: formatStorage(component.storageTB), priority: 4 });
  if (component.powerWatts > 0) badges.push({ label: formatPower(component.powerWatts), priority: 5 });

  const topBadges = badges.slice(0, 3);

  return (
    <div
      className={cn(
        'absolute select-none rounded-lg border bg-base-850 shadow-elevated transition-shadow',
        'w-[140px] cursor-grab active:cursor-grabbing group',
        selected
          ? 'border-accent ring-2 ring-accent/40 shadow-glow'
          : 'border-base-600 hover:border-base-500'
      )}
      style={{
        left: component.x,
        top: component.y,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${component.name} node. Use arrow keys to move. Delete to remove.`}
    >
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-base-700">
        <span
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
            selected ? 'bg-accent/15 text-accent' : 'bg-base-800 text-base-200'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-base-50 truncate leading-tight">
            {component.name}
          </p>
          {component.manufacturer && component.manufacturer !== 'Generic' && component.manufacturer !== '—' && (
            <p className="text-2xs text-base-400 truncate leading-tight">
              {component.manufacturer}
            </p>
          )}
        </div>
        {component.hasOverrides && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
            title="Customized values"
            aria-label="Has customized values"
          />
        )}
      </div>

      <div className="px-2.5 py-1.5 flex flex-wrap gap-1">
        <NodeBadge label={formatCost(component.price, component.currency)} variant="cost" />
        {topBadges.map((b) => (
          <NodeBadge key={b.label} label={b.label} />
        ))}
      </div>

      <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="flex items-center justify-center w-6 h-6 rounded-md bg-base-800 border border-base-600 text-base-300 hover:text-accent hover:border-accent transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onStartConnecting(component.instanceId);
          }}
          title="Connect from this node"
          aria-label="Start connection from this node"
        >
          <Link2 className="w-3 h-3" />
        </button>
        <button
          className="flex items-center justify-center w-6 h-6 rounded-md bg-base-800 border border-base-600 text-base-300 hover:text-base-100 hover:border-base-500 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(component.instanceId);
          }}
          title="Duplicate"
          aria-label="Duplicate node"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          className="flex items-center justify-center w-6 h-6 rounded-md bg-base-800 border border-base-600 text-base-300 hover:text-danger-400 hover:border-danger-500/50 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.instanceId);
          }}
          title="Delete"
          aria-label="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div
        className={cn(
          'absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors',
          isConnectingFrom ? 'bg-accent border-accent' : 'bg-base-600 border-base-500'
        )}
      />
      <div
        className={cn(
          'absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors',
          'bg-base-600 border-base-500'
        )}
      />
    </div>
  );
}

function NodeBadge({ label, variant }: { label: string; variant?: 'cost' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-2xs font-mono font-medium rounded',
        variant === 'cost'
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'bg-base-800 text-base-200 border border-base-700'
      )}
    >
      {label}
    </span>
  );
}
