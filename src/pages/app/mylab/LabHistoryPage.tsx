import { useMemo } from 'react';
import { History } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useI18n } from '@/i18n/I18nContext';
import { loadHistory, type LabSummary } from '@/features/mylab/proposalStore';
import { formatCost, formatNetwork, formatPower, formatStorage } from '@/utils/calculations';

function SummaryList({ s, currency }: { s: LabSummary; currency: string }) {
  const { t } = useI18n();
  return (
    <ul className="mt-1 space-y-0.5 text-xs text-base-200 font-mono">
      <li>{s.devices} {t('proposal.devices').toLowerCase()}</li>
      <li>{s.storageTB ? formatStorage(s.storageTB) : '0TB'}</li>
      <li>{s.powerW ? formatPower(Math.round(s.powerW)) : '0W'} · {formatCost(s.monthlyCost, currency)}/{t('proposal.month')}</li>
      <li>{s.fastestGbps ? formatNetwork(s.fastestGbps) : '—'}</li>
    </ul>
  );
}

export function LabHistoryPage() {
  const { t, langId } = useI18n();
  const entries = useMemo(() => loadHistory(), []);
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton to="/app/my-lab" label={t('mylab.title')} />
        <h1 className="mt-4 text-2xl font-bold text-base-50">{t('history.title')}</h1>
        <p className="mt-1 text-sm text-base-300">{t('history.tagline')}</p>
        {entries.length === 0 ? (
          <Card className="mt-6">
            <EmptyState icon={<History className="w-8 h-8" />} title={t('history.empty.title')} description={t('history.empty.description')} />
          </Card>
        ) : (
          <ol className="mt-6 space-y-3">
            {entries.map((e) => (
              <li key={e.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-base-400">{new Date(e.appliedAt).toLocaleString(langId)}</span>
                    <Badge variant="info">{t(`plan.type.${e.changeType}`)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-base-50 break-words">{e.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-2xs uppercase tracking-wide text-base-400">{t('history.before')}</p>
                      <SummaryList s={e.before} currency={e.currency} />
                    </div>
                    <div>
                      <p className="text-2xs uppercase tracking-wide text-base-400">{t('history.after')}</p>
                      <SummaryList s={e.after} currency={e.currency} />
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
