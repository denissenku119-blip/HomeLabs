import { type PointerEvent as ReactPointerEvent } from 'react';
import type { ProjectComponent, Connection } from '@/types';
import { CONNECTION_TYPE_COLORS } from '@/data/constants';

interface CanvasConnectionsProps {
  components: ProjectComponent[];
  connections: Connection[];
  selectedConnId: string | null;
  onSelectConnection: (id: string | null) => void;
  onDeleteConnection: (id: string) => void;
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;

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

export function CanvasConnections({
  components,
  connections,
  selectedConnId,
  onSelectConnection,
  onDeleteConnection,
}: CanvasConnectionsProps) {
  const compMap = new Map(components.map((c) => [c.instanceId, c]));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      {connections.map((conn) => {
        const from = compMap.get(conn.fromId);
        const to = compMap.get(conn.toId);
        if (!from || !to) return null;

        const { x, y, endX, endY } = getEdgePoint(from, to);
        const midX = (x + endX) / 2;
        const midY = (y + endY) / 2;
        const color = CONNECTION_TYPE_COLORS[conn.type];
        const isSelected = conn.id === selectedConnId;

        return (
          <g key={conn.id} className="pointer-events-auto">
            {/* Invisible wider hit area */}
            <line
              x1={x}
              y1={y}
              x2={endX}
              y2={endY}
              stroke="transparent"
              strokeWidth="16"
              className="cursor-pointer"
              onPointerDown={(e: ReactPointerEvent<SVGLineElement>) => {
                e.stopPropagation();
                onSelectConnection(isSelected ? null : conn.id);
              }}
            />
            {/* Visible line */}
            <line
              x1={x}
              y1={y}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeOpacity={isSelected ? 1 : 0.6}
              strokeDasharray={conn.type === 'wifi' ? '6 3' : conn.type === 'power' ? '2 2' : undefined}
            />
            {/* Arrow */}
            <circle cx={endX} cy={endY} r="3" fill={color} fillOpacity={0.8} />
            {/* Type label */}
            {isSelected && (
              <foreignObject x={midX - 40} y={midY - 24} width="80" height="48">
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="px-2 py-0.5 text-2xs font-medium rounded-md bg-base-800 border whitespace-nowrap"
                    style={{ color, borderColor: `${color}40` }}
                  >
                    {conn.type}
                  </span>
                  <button
                    className="px-1.5 py-0.5 text-2xs font-medium rounded-md bg-base-800 border border-base-600 text-danger-400 hover:bg-danger-50/30 transition-colors"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConnection(conn.id);
                    }}
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
