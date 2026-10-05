import { useEffect, useState, type ReactNode } from 'react';
import { Check, Crown, HardDrive } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/pro/UpgradePanel';
import { usePlan } from '@/features/entitlements/plan';
import { useI18n } from '@/i18n/I18nContext';

/** Pro gate for My Lab. Uses the existing verified entitlement; My Lab data is never touched. */
export function MyLabProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePlan();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) return null;
  if (isPro) return <>{children}</>;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide text-accent">
                <Crown className="w-3.5 h-3.5" /> {t('progate.proBadge')}
              </span>
              <h1 className="mt-1 text-xl font-bold text-base-50">{t('progate.mylab.title')}</h1>
              <p className="mt-2 text-sm text-base-300 leading-relaxed">{t('progate.mylab.body')}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-base-200">
                <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                {t(`progate.mylab.f${i}`)}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link to="/app">
              <Button variant="ghost" className="w-full sm:w-auto">{t('progate.back')}</Button>
            </Link>
            <Button leftIcon={<Crown className="w-4 h-4" />} onClick={() => setUpgradeOpen(true)}>
              {t('progate.upgrade')}
            </Button>
          </div>
        </Card>
      </div>
      <UpgradeModal open={upgradeOpen} reason={t('progate.mylab.reason')} onClose={() => setUpgradeOpen(false)} />
    </AppShell>
  );
}
