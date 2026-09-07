import { Link } from 'react-router-dom';
import { Cpu, HardDrive, Network, Zap, Server, Shield, Box } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ProjectComponent, ComponentCategory } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  status: string;
  components: ProjectComponent[];
  estimatedCost: number;
  onClick?: () => void;
}

const categoryIcons: Record<ComponentCategory, React.ElementType> = {
  compute: Cpu,
  storage: HardDrive,
  networking: Network,
  power: Zap,
  virtualization: Server,
  security: Shield,
  other: Box,
};

export function ProjectCard({
  id,
  name,
  status,
  components,
  estimatedCost,
  onClick,
}: ProjectCardProps) {
  const componentCount = components.length;
  const totalPower = components.reduce((sum, c) => sum + (c.powerWatts || 0), 0);

  const statusVariant = status === 'draft' ? 'default' : 'accent';

  const content = (
    <Card hover className="group cursor-pointer h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-base-50 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <Badge variant={statusVariant} dot className="mt-2">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(
          components.reduce((acc, c) => {
            acc[c.category] = true;
            return acc;
          }, {} as Record<string, boolean>)
        ).slice(0, 4).map((cat) => {
          const Icon = categoryIcons[cat as ComponentCategory] ?? Box;
          return (
            <span
              key={cat}
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 text-2xs font-medium rounded-md',
                'bg-base-850 border border-base-700 text-base-200'
              )}
            >
              <Icon className="w-3 h-3" />
              {cat}
            </span>
          );
        })}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-base-700">
        <div>
          <p className="text-2xs text-base-400 uppercase tracking-wide">Components</p>
          <p className="text-sm font-semibold font-mono text-base-100">{componentCount}</p>
        </div>
        <div>
          <p className="text-2xs text-base-400 uppercase tracking-wide">Power</p>
          <p className="text-sm font-semibold font-mono text-base-100">{totalPower > 0 ? `${totalPower}W` : '—'}</p>
        </div>
        <div>
          <p className="text-2xs text-base-400 uppercase tracking-wide">Cost</p>
          <p className="text-sm font-semibold font-mono text-accent">
            {estimatedCost > 0 ? `$${estimatedCost.toLocaleString()}` : '—'}
          </p>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0}>
        {content}
      </div>
    );
  }

  return <Link to={`/app/project/${id}`}>{content}</Link>;
}
