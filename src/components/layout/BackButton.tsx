import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to: string;
  label: string;
  className?: string;
}

/**
 * Context-aware back control. Always navigates to an explicit parent route
 * through the router (never window.history), so it behaves the same in the
 * browser and inside the Android WebView.
 */
export function BackButton({ to, label, className }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-3 -ms-3 rounded-lg',
        'text-sm font-medium text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors',
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 rtl:rotate-180 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
