import { cn } from '@/lib/utils';

type Status = 'healthy' | 'warning' | 'danger' | 'neutral' | 'draft';

interface StatusIndicatorProps {
  status: Status;
  label: string;
  className?: string;
}

const config: Record<Status, { dot: string; text: string }> = {
  healthy: { dot: 'bg-success-400', text: 'text-success-400' },
  warning: { dot: 'bg-warning-400', text: 'text-warning-400' },
  danger: { dot: 'bg-danger-400', text: 'text-danger-400' },
  neutral: { dot: 'bg-base-400', text: 'text-base-200' },
  draft: { dot: 'bg-base-300', text: 'text-base-200' },
};

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const { dot, text } = config[status];
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-sm font-medium', text, className)}
      role="status"
    >
      <span className={cn('w-2 h-2 rounded-full animate-pulse-subtle', dot)} />
      {label}
    </span>
  );
}
