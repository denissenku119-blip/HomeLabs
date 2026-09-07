import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-base-800 text-base-200 border-base-600',
  success: 'bg-success-50/40 text-success-400 border-success-500/30',
  warning: 'bg-warning-50/40 text-warning-400 border-warning-500/30',
  danger: 'bg-danger-50/40 text-danger-400 border-danger-500/30',
  info: 'bg-info-50/40 text-info-400 border-info-500/30',
  accent: 'bg-accent-900/40 text-accent border-accent-600/30',
};

const dotColors: Record<Variant, string> = {
  default: 'bg-base-400',
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  danger: 'bg-danger-400',
  info: 'bg-info-400',
  accent: 'bg-accent',
};

export function Badge({ variant = 'default', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium rounded-full border',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
