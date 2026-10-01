import { useMemo } from 'react';
import { Activity, ListChecks } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/router-compat';
import { useI18n } from '@/i18n/I18nContext';
import { HEALTH_AREAS, healthSummaryKey, type HealthArea } from '@/features/mylab/labHealth';
import { formatCost, formatNetwork, formatPower, formatStorage } from '@/utils/calculations';
import { CheckItem, StatusBadge, useLabHealth } from './labHealthUi';

export function LabHealthPage() {
  const { t } = useI18n();
  const { lab, health } = useLabHealth();
  const names = useMemo(() => new Map((lab?.components ?? []).map((c) => [c.instanceId, c.name])), [lab]);

  if (!lab || !health) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <BackButton to="/app/my-lab" label={t('mylab.title')} />
          <Card className="mt-6">
            <EmptyState
              icon={<Activity className="w-8 h-8" />}
              title={t('mylab.empty.title')}
              description={t('mylab.empty.description')}
              action={<Link to="/app/my-lab/setup"><Button>{t('mylab.setup.cta')}</Button></Link>}
            />
          </Card>
        </div>
      </AppShell>
    );
  }

  const { metrics, analysis } = health;
  const dash = '—';
  const facts: Record<HealthArea, { label: string; value: string }[]> = {
    storage: [
      { label: t('labhealth.fact.rawStorage'), value: metrics.storage.hasStorageData ? formatStorage(metrics.storage.totalRawStorageTB) : dash },
      { label: t('labhealth.fact.storageDevices'), value: String(metrics.storage.componentBreakdown.length) },
      { label: t('labhealth.fact.driveBays'), value: metrics.storage.knownDriveBays != null ? String(metrics.storage.knownDriveBays) : dash },
    ],
    power: [
      { label: t('labhealth.fact.power'), value: metrics.power.totalKnownPowerWatts > 0 ? formatPower(metrics.power.totalKnownPowerWatts) : dash },
      { label: t('labhealth.fact.monthly'), value: metrics.energy.hasPowerData ? formatCost(metrics.energy.monthlyCost, lab.currency) : dash },
      { label: t('labhealth.fact.annual'), value: metrics.energy.hasPowerData ? formatCost(metrics.energy.annualCost, lab.currency) : dash },
    ],
    network: [
      { label: t('mylab.connections'), value: String(metrics.network.connectionCount) },
      { label: t('mylab.fastestLink'), value: metrics.network.fastestInterfaceGbps ? formatNetwork(metrics.network.fastestInterfaceGbps) : dash },
      { label: t('labhealth.fact.unknownLinks'), value: String(metrics.network.unknownLinks) },
    ],
    expansion: [],
    backup: [],
    architecture: [
      { label: t('mylab.stat.devices'), value: String(metrics.componentCount) },
      { label: t('labhealth.fact.score'), value: `${analysis.score}/${analysis.maxScore}` },
    ],
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <BackButton to="/app/my-lab" label={t('mylab.title')} />
        <h1 className="mt-3 text-2xl font-bold text-base-50">{t('labhealth.title')}</h1>
        <p className="mt-1 text-sm text-base-300">{t('labhealth.tagline')}</p>
        <p className="mt-1 text-xs text-base-400">{t('labhealth.modelNote')}</p>

        <Card className="mt-6 p-4 sm:p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HEALTH_AREAS.map((area) => (
              <li key={area}>
                <a href={`#health-${area}`} className="flex min-h-[44px] items-center justify-between gap-2 rounded-lg border border-base-700 bg-base-850 px-3">
                  <span className="text-sm text-base-100">{t(`labhealth.area.${area}`)}</span>
                  <StatusBadge status={health.areaStatus[area]} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-base-200">
            {t(healthSummaryKey(health), { attention: health.counts.attention, check: health.counts.check })}
          </p>
          <Link to="/app/my-lab/checks" className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-accent">
            <ListChecks className="w-4 h-4" />
            {t('labhealth.checks.open')} →
          </Link>
        </Card>

        <div className="mt-6 space-y-5">
          {HEALTH_AREAS.map((area) => {
            const items = health.checks.filter((c) => c.area === area);
            return (
              <section key={area} id={`health-${area}`} className="scroll-mt-20">
                <Card className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-base-50">{t(`labhealth.area.${area}`)}</h2>
                    <StatusBadge status={health.areaStatus[area]} />
                  </div>
                  {facts[area].length > 0 && (
                    <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {facts[area].map((f) => (
                        <div key={f.label}>
                          <dt className="text-2xs text-base-400">{f.label}</dt>
                          <dd className="text-sm font-mono text-base-50">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {area === 'power' && metrics.energy.hasPowerData && (
                    <p className="mt-2 text-xs text-base-400">
                      {t('labhealth.rateNote', { rate: String(metrics.energy.electricityCostPerKwh) })}
                    </p>
                  )}
                  {items.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {items.map((c) => <CheckItem key={c.id} check={c} names={names} />)}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-base-400">{t('labhealth.noData')}</p>
                  )}
                </Card>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
