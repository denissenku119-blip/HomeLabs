import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { shareApp, PLAY_STORE_URL } from '@/features/share/shareApp';
import { useI18n } from '@/i18n/I18nContext';

interface ShareAppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * Compact share control. Never blocks the user: a failed or cancelled share
 * simply leaves the button in its normal state.
 */
export function ShareAppButton({
  variant = 'secondary',
  size = 'md',
  className,
  label,
}: ShareAppButtonProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [method, setMethod] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await shareApp();
      setMethod(result.method);
      setStatus(result.success ? 'done' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={busy}
        leftIcon={
          status === 'done' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />
        }
        aria-label={t('share.appAria')}
        className="min-h-[44px]"
      >
        {label ?? t('share.app')}
      </Button>
      <span className="text-2xs text-base-400 break-all" role="status" aria-live="polite">
        {status === 'done' && (
          <>
            {method === 'clipboard' ? `${t('share.linkCopied')} ` : `${t('share.shared')} `}
            <span className="text-base-200">{PLAY_STORE_URL}</span>
          </>
        )}
        {status === 'error' && t('share.unavailable')}
      </span>
    </div>
  );
}
