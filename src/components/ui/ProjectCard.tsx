import { Link } from '@/lib/router-compat';
import { useEffect, useRef, useState } from 'react';
import { Cpu, HardDrive, Network, Zap, Server, Shield, Box, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ProjectComponent, ComponentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';

interface ProjectCardProps {
  id: string;
  name: string;
  status: string;
  components: ProjectComponent[];
  estimatedCost: number;
  onClick?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
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
  onDelete,
  onRename,
}: ProjectCardProps) {
  const { t } = useI18n();
  const componentCount = components.length;
  const totalPower = components.reduce((sum, c) => sum + (c.powerWatts || 0), 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointer = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [menuOpen]);

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
        {(onDelete || onRename) && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label="Project actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="p-1.5 -me-1.5 rounded-md text-base-400 hover:text-base-100 hover:bg-base-800 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute end-0 top-9 z-20 min-w-40 rounded-lg border border-base-700 bg-base-900 shadow-elevated py-1"
              >
                {onRename && (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-base-200 hover:bg-base-800 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRename();
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Rename project
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-danger-400 hover:bg-base-800 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete project
                  </button>
                )}
              </div>
            )}
          </div>
        )}
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
              {t(`hardware.${cat}`)}
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
