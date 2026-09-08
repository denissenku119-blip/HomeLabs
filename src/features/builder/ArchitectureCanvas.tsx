import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import type { ProjectComponent, Connection, HardwareDefinition, ConnectionType } from '@/types';
import { CanvasNode } from './CanvasNode';
import { CanvasConnections } from './CanvasConnections';
import { CanvasToolbar } from './CanvasToolbar';
import { EmptyCanvasState } from './EmptyCanvasState';
import { cn } from '@/lib/utils';

const MIN_SCALE = 0.3;
const MAX_SCALE = 2;
const NODE_W = 140;
const NODE_H = 70;

interface ArchitectureCanvasProps {
  components: ProjectComponent[];
  connections: Connection[];
  selectedId: string | null;
  connectingFromId: string | null;
  pendingConnectionType: ConnectionType;
  scale: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  onScaleChange: (scale: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onToggleGrid: () => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onAdd: (def: HardwareDefinition, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStartConnecting: (id: string) => void;
  onCompleteConnecting: (targetId: string) => void;
  onCancelConnecting: () => void;
  onDeleteConnection: (id: string) => void;
  onAddFirst: () => void;
  draggedDef: HardwareDefinition | null;
  onDropDef: (def: HardwareDefinition, x: number, y: number) => void;
}

export function ArchitectureCanvas(props: ArchitectureCanvasProps) {
  const {
    components,
    connections,
    selectedId,
    connectingFromId,
    scale,
    pan,
    showGrid,
    onScaleChange,
    onPanChange,
    onToggleGrid,
    onSelect,
    onMove,
    onDelete,
    onDuplicate,
    onStartConnecting,
    onCompleteConnecting,
    onCancelConnecting,
    onDeleteConnection,
    onAddFirst,
    draggedDef,
    onDropDef,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const panState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / scale,
        y: (clientY - rect.top - pan.y) / scale,
      };
    },
    [pan, scale]
  );

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
      onScaleChange(newScale);
    }
  };

  const handleCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Click on empty canvas
    if (connectingFromId) {
      onCancelConnecting();
    }
    onSelect(null);
    setSelectedConnId(null);
    panState.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panState.current) return;
    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    onPanChange({ x: panState.current.panX + dx, y: panState.current.panY + dy });
  };

  const handleCanvasPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (panState.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      panState.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedDef) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    onDropDef(draggedDef, x - NODE_W / 2, y - NODE_H / 2);
  };

  const handleZoomIn = () => onScaleChange(Math.min(MAX_SCALE, scale + 0.1));
  const handleZoomOut = () => onScaleChange(Math.max(MIN_SCALE, scale - 0.1));
  const handleReset = () => {
    onScaleChange(1);
    onPanChange({ x: 0, y: 0 });
  };
  const handleFit = () => {
    if (components.length === 0) {
      handleReset();
      return;
    }
    const minX = Math.min(...components.map((c) => c.x));
    const maxX = Math.max(...components.map((c) => c.x + NODE_W));
    const minY = Math.min(...components.map((c) => c.y));
    const maxY = Math.max(...components.map((c) => c.y + NODE_H));
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const padding = 60;
    const scaleX = (rect.width - padding * 2) / contentW;
    const scaleY = (rect.height - padding * 2) / contentH;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(scaleX, scaleY)));
    onScaleChange(newScale);
    onPanChange({
      x: -minX * newScale + (rect.width - contentW * newScale) / 2,
      y: -minY * newScale + (rect.height - contentH * newScale) / 2,
    });
  };

  const isEmpty = components.length === 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex-1 min-h-0 overflow-hidden bg-base-950',
        showGrid && 'grid-bg',
        'cursor-grab active:cursor-grabbing'
      )}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CanvasToolbar
        scale={scale}
        showGrid={showGrid}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
        onReset={handleReset}
        onToggleGrid={onToggleGrid}
      />

      {/* Connection mode banner */}
      {connectingFromId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-2xs text-accent font-medium animate-fade-in">
          Click a target node to connect — click empty space to cancel
        </div>
      )}

      {/* Canvas content layer */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <CanvasConnections
          components={components}
          connections={connections}
          selectedConnId={selectedConnId}
          onSelectConnection={setSelectedConnId}
          onDeleteConnection={onDeleteConnection}
        />

        {components.map((comp) => (
          <CanvasNode
            key={comp.instanceId}
            component={comp}
            selected={selectedId === comp.instanceId}
            isConnectingFrom={connectingFromId === comp.instanceId}
            scale={scale}
            onSelect={onSelect}
            onMove={onMove}
            onStartConnecting={(id) => {
              onStartConnecting(id);
            }}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>

      {/* Connection target overlay */}
      {connectingFromId &&
        components
          .filter((c) => c.instanceId !== connectingFromId)
          .map((c) => (
            <div
              key={c.instanceId}
              className="absolute z-15"
              style={{
                left: c.x * scale + pan.x,
                top: c.y * scale + pan.y,
                width: NODE_W * scale,
                height: NODE_H * scale,
                touchAction: 'none',
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onCompleteConnecting(c.instanceId);
              }}
            />
          ))}

      {isEmpty && <EmptyCanvasState onAddFirst={onAddFirst} />}
    </div>
  );
}
