import { Globe, Router, Share2, HardDrive, Server, MonitorSmartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodes = [
  { id: 'internet', label: 'Internet', icon: Globe, x: 50, y: 8, color: 'text-info-400' },
  { id: 'router', label: 'Router', icon: Router, x: 50, y: 32, color: 'text-accent' },
  { id: 'switch', label: 'Switch', icon: Share2, x: 50, y: 56, color: 'text-accent' },
  { id: 'nas', label: 'NAS', icon: HardDrive, x: 20, y: 82, color: 'text-base-100' },
  { id: 'server', label: 'Server', icon: Server, x: 50, y: 82, color: 'text-base-100' },
  { id: 'minipc', label: 'Mini PC', icon: MonitorSmartphone, x: 80, y: 82, color: 'text-base-100' },
];

const connections = [
  { from: 'internet', to: 'router' },
  { from: 'router', to: 'switch' },
  { from: 'switch', to: 'nas' },
  { from: 'switch', to: 'server' },
  { from: 'switch', to: 'minipc' },
];

export function NetworkTopology({ className }: { className?: string }) {
  const getNode = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className={cn('relative w-full aspect-[4/3] max-w-lg mx-auto', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Connection lines */}
        {connections.map((conn, i) => {
          const from = getNode(conn.from);
          const to = getNode(conn.to);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(52, 211, 153, 0.3)"
              strokeWidth="0.4"
              strokeDasharray="2 1"
              className="animate-draw-line"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center gap-1 animate-slide-up"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div
              className={cn(
                'flex items-center justify-center w-11 h-11 rounded-lg bg-base-850 border border-base-600 shadow-elevated',
                node.color
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-2xs font-medium text-base-200 whitespace-nowrap">
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
