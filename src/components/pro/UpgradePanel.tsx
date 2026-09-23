import { Check, Crown, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PRO_BENEFITS, PRO_PRICE_LABEL } from '@/features/entitlements/plan';
import { useI18n } from '@/i18n/I18nContext';

interface UpgradePanelProps {
  /** Short line explaining why the upgrade is being shown. */
  reason?: string;
  onClose?: () => void;
}

export function UpgradePanel({ reason, onClose }: UpgradePanelProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent flex-shrink-0">
          <Crown className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-base-50">{t('pro.title')}</h2>
          <p className="text-sm font-semibold text-accent mt-0.5">
            {t('pro.price')}
          </p>
          {reason && <p className="text-xs text-base-300 mt-1.5">{reason}</p>}
        </div>
      </div>

      <ul className="flex flex-col gap-2 rounded-xl border border-base-700 bg-base-850 p-3">
        {PRO_BENEFITS.map((benefit, index) => (
          <li key={benefit} className="flex items-center gap-2 text-xs text-base-100">
            <Check className="w-3.5 h-3.5 text-success-400 flex-shrink-0" />
            {t(`pro.benefit.${index + 1}`)}
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2 text-2xs text-base-400">
        <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        {t('pro.checkout')}
      </p>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            {t('pro.continueFree')}
          </Button>
        </div>
      )}
    </div>
  );
}

interface UpgradeModalProps {
  open: boolean;
  reason?: string;
  onClose: () => void;
}

export function UpgradeModal({ open, reason, onClose }: UpgradeModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <UpgradePanel reason={reason} onClose={onClose} />
    </Modal>
  );
}
