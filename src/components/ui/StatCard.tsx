import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  hint?: string;
  className?: string;
}

const variantStyles = {
  default: { value: 'text-base-50', icon: 'text-base-300' },
  accent: { value: 'text-accent', icon: 'text-accent' },
  success: { value: 'text-success-400', icon: 'text-success-400' },
  warning: { value: 'text-warning-400', icon: 'text-warning-400' },
  danger: { value: 'text-danger-400', icon: 'text-danger-400' },
};

export function StatCard({
  label,
  value,
  unit,
  icon,
  variant = 'default',
  hint,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-4 bg-base-850 border border-base-700 rounded-lg',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-base-300 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-2xl font-bold font-mono tabular-nums', styles.value)}>
          {value}
        </span>
        {unit && <span className="text-sm text-base-300">{unit}</span>}
      </div>
      {hint && <span className="text-xs text-base-400 mt-0.5">{hint}</span>}
    </div>
  );
}
