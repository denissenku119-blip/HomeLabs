import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { ProjectComponent, Connection } from '@/types';

interface CanvasConnectionsProps {
  components: ProjectComponent[];
  connections: Connection[];
  selectedConnId: string | null;
  onSelectConnection: (id: string | null) => void;
  onDeleteConnection: (id: string) => void;
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;

interface Point {
  x: number;
  y: number;
}

type PortPositions = Map<string, Point[]>;

function getNodeCenter(comp: ProjectComponent) {
  return {
    x: comp.x + NODE_WIDTH / 2,
    y: comp.y + NODE_HEIGHT / 2,
  };
}

function getEdgePoint(from: ProjectComponent, to: ProjectComponent) {
  const fromCenter = getNodeCenter(from);
  const toCenter = getNodeCenter(to);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  const halfW = NODE_WIDTH / 2;
  const halfH = NODE_HEIGHT / 2;

  // Find intersection with rectangle border
  const tan = Math.abs(dy / (dx || 0.0001));
  let offsetX: number;
  let offsetY: number;

  if (tan < halfH / halfW) {
    offsetX = halfW * Math.sign(dx);
    offsetY = offsetX * (dy / (dx || 0.0001));
  } else {
    offsetY = halfH * Math.sign(dy);
    offsetX = offsetY * (dx / (dy || 0.0001));
  }

  return {
    x: fromCenter.x + offsetX,
    y: fromCenter.y + offsetY,
    endX: toCenter.x - offsetX,
    endY: toCenter.y - offsetY,
  };
}

function getCurvePath(
  x: number,
  y: number,
  endX: number,
  endY: number,
  connectionIndex: number
) {
  const dx = endX - x;
  const dy = endY - y;
  const distance = Math.hypot(dx, dy);
  const direction = connectionIndex % 2 === 0 ? 1 : -1;
  const lane = Math.floor(connectionIndex / 2) + 1;
  const bend = Math.min(96, Math.max(24, distance * 0.18) * lane) * direction;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const controlX = dx * 0.42;
    return {
      path: `M ${x} ${y} C ${x + controlX} ${y + bend}, ${endX - controlX} ${endY + bend}, ${endX} ${endY}`,
      midX: (x + endX) / 2,
      midY: (y + endY) / 2 + bend * 0.75,
    };
  }

  const controlY = dy * 0.42;
  return {
    path: `M ${x} ${y} C ${x + bend} ${y + controlY}, ${endX + bend} ${endY - controlY}, ${endX} ${endY}`,
    midX: (x + endX) / 2 + bend * 0.75,
    midY: (y + endY) / 2,
  };
}

function closestPortPair(fromPorts: Point[], toPorts: Point[]) {
  let closest: { from: Point; to: Point; distance: number } | null = null;

  for (const from of fromPorts) {
    for (const to of toPorts) {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (!closest || distance < closest.distance) closest = { from, to, distance };
    }
  }

  return closest;
}

export function CanvasConnections({
  components,
  connections,
  selectedConnId,
  onSelectConnection,
  onDeleteConnection,
}: CanvasConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [portPositions, setPortPositions] = useState<PortPositions>(new Map());
  const compMap = new Map(components.map((c) => [c.instanceId, c]));

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const canvasLayer = svg?.parentElement;
    if (!svg || !canvasLayer) return;

    let frame = 0;
    const measurePorts = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const matrix = svg.getScreenCTM();
        if (!matrix) return;
        const inverse = matrix.inverse();
        const next: PortPositions = new Map();
        const handles = canvasLayer.querySelectorAll<HTMLElement>('[data-connection-node][data-component-id]');

        handles.forEach((handle) => {
          const componentId = handle.dataset.componentId;
          if (!componentId) return;
          const rect = handle.getBoundingClientRect();
          const screenPoint = new DOMPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          const canvasPoint = screenPoint.matrixTransform(inverse);
          const existing = next.get(componentId) ?? [];
          existing.push({ x: canvasPoint.x, y: canvasPoint.y });
          next.set(componentId, existing);
        });

        setPortPositions(next);
      });
    };

    measurePorts();
    const resizeObserver = new ResizeObserver(measurePorts);
    resizeObserver.observe(canvasLayer);
    canvasLayer.querySelectorAll<HTMLElement>('[data-connection-node]').forEach((handle) => {
      resizeObserver.observe(handle);
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [components]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="connection-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connections.map((conn, connectionIndex) => {
        const from = compMap.get(conn.fromId);
        const to = compMap.get(conn.toId);
        if (!from || !to) return null;

        const measuredPorts = closestPortPair(
          portPositions.get(from.instanceId) ?? [],
          portPositions.get(to.instanceId) ?? []
        );
        const fallback = getEdgePoint(from, to);
        const x = measuredPorts?.from.x ?? fallback.x;
        const y = measuredPorts?.from.y ?? fallback.y;
        const endX = measuredPorts?.to.x ?? fallback.endX;
        const endY = measuredPorts?.to.y ?? fallback.endY;
        const { path, midX, midY } = getCurvePath(x, y, endX, endY, connectionIndex);
        const color = 'var(--color-accent)';
        const isSelected = conn.id === selectedConnId;

        return (
          <g key={conn.id} className="pointer-events-auto">
            {/* Invisible wider hit area — generous for touch */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="28"
              strokeLinecap="round"
              className="cursor-pointer"
              style={{ touchAction: 'none' }}
              onPointerDown={(e: ReactPointerEvent<SVGLineElement>) => {
                e.stopPropagation();
                onSelectConnection(isSelected ? null : conn.id);
              }}
            />
            {/* Soft glow under the crisp connection path */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? 9 : 7}
              strokeOpacity={isSelected ? 0.28 : 0.18}
              strokeLinecap="round"
              filter="url(#connection-glow)"
              className="pointer-events-none"
            />
            {/* Visible curved line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? 4 : 3}
              strokeOpacity={isSelected ? 1 : 0.95}
              strokeLinecap="round"
              strokeDasharray={conn.type === 'wifi' ? '6 3' : conn.type === 'power' ? '2 2' : undefined}
              className="pointer-events-none"
            />
            {/* Endpoint dots */}
            <circle cx={x} cy={y} r="3.5" fill={color} />
            <circle cx={endX} cy={endY} r="4" fill={color} />
            {/* Type label + remove control */}
            {isSelected && (
              <foreignObject x={midX - 70} y={midY - 22} width="140" height="44">
                <div className="flex items-center justify-center gap-1.5 h-11">
                  <span
                    className="px-2 py-1 text-2xs font-medium rounded-md bg-base-800 border whitespace-nowrap"
                    style={{ color, borderColor: `${color}40` }}
                  >
                    {conn.type}
                  </span>
                  <button
                    className="px-3 py-2 text-2xs font-semibold rounded-md bg-base-800 border border-danger-500/50 text-danger-400 hover:bg-danger-500/10 transition-colors"
                    style={{ touchAction: 'none' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteConnection(conn.id);
                      onSelectConnection(null);
                    }}
                    aria-label="Remove this connection"
                  >
                    Remove
                  </button>
                </div>
              </foreignObject>
            )}
          </g>

        );
      })}
    </svg>
  );
}
