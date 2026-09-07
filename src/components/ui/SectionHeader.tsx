import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="text-2xs font-semibold text-accent uppercase tracking-wider">
            {eyebrow}
          </span>
        )}
        <h2 className="text-xl font-bold text-base-50 sm:text-2xl">{title}</h2>
        {description && (
          <p className="text-sm text-base-300 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
