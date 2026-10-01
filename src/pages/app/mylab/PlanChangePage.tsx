import { useMemo } from 'react';
import { PlusCircle, MinusCircle, Repeat, ArrowUpCircle, Cable, HardDrive, Network, FlaskConical } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link, useNavigate } from '@/lib/router-compat';
import { useI18n } from '@/i18n/I18nContext';
import { hasMyLab } from '@/features/mylab/myLabStore';
import { CHANGE_TYPES, loadProposal, startProposal, type ChangeType } from '@/features/mylab/proposalStore';

export const CHANGE_ICONS: Record<ChangeType, React.ElementType> = {
  add: PlusCircle,
  remove: MinusCircle,
  replace: Repeat,
  upgrade: ArrowUpCircle,
  connection: Cable,
  storage: HardDrive,
  network: Network,
};

export function PlanChangePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const hasLab = useMemo(() => hasMyLab(), []);
  const existing = useMemo(() => loadProposal(), []);

  const start = (type: ChangeType) => {
    if (existing && !window.confirm(t('plan.replaceExisting'))) return;
    if (startProposal(type)) navigate('/app/my-lab/proposal');
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton to="/app/my-lab" label={t('mylab.title')} />
        <h1 className="mt-4 text-2xl font-bold text-base-50">{t('plan.title')}</h1>
        <p className="mt-1 text-sm text-base-300">{t('plan.tagline')}</p>

        {!hasLab ? (
          <Card className="mt-6">
            <EmptyState
              icon={<FlaskConical className="w-8 h-8" />}
              title={t('mylab.empty.title')}
              description={t('mylab.empty.description')}
              action={<Link to="/app/my-lab/setup"><Button>{t('mylab.setup.cta')}</Button></Link>}
            />
          </Card>
        ) : (
          <>
            {existing && (
              <Card className="mt-6 p-4 flex flex-wrap items-center justify-between gap-3 border-accent/40">
                <div>
                  <p className="text-sm font-semibold text-base-50">{t('plan.inProgress')}</p>
                  <p className="text-xs text-base-300">{t(`plan.type.${existing.changeType}`)}</p>
                </div>
                <Link to="/app/my-lab/proposal"><Button>{t('plan.continue')}</Button></Link>
              </Card>
            )}
            <p className="mt-6 text-sm font-medium text-base-200">{t('plan.choose')}</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {CHANGE_TYPES.map((type) => {
                const Icon = CHANGE_ICONS[type];
                return (
                  <button key={type} type="button" onClick={() => start(type)} className="text-start">
                    <Card hover className="p-4 h-full min-h-[72px] flex items-start gap-3">
                      <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-base-50">{t(`plan.type.${type}`)}</p>
                        <p className="mt-1 text-xs text-base-300">{t(`plan.hint.${type}`)}</p>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-xs text-base-400">{t('plan.safeNote')}</p>
          </>
        )}
      </div>
    </AppShell>
  );
}
