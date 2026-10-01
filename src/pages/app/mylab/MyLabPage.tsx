import { useMemo } from 'react';
import { Server, HardDrive, Zap, Network, Cpu, Wrench, Workflow, AlertTriangle, Activity, ListChecks, FlaskConical, History, FileText } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { useI18n } from '@/i18n/I18nContext';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { analyzeArchitecture } from '@/features/analysis/analysisEngine';
import { formatCost, formatNetwork, formatPower, formatStorage } from '@/utils/calculations';
import { loadMyLab } from '@/features/mylab/myLabStore';
import { loadProposal } from '@/features/mylab/proposalStore';
import { CATEGORY_ORDER } from '@/data/constants';

export function MyLabPage() {
  const { t } = useI18n();
  const lab = useMemo(() => loadMyLab(), []);
  const proposalOpen = useMemo(() => !!loadProposal(), []);
  const hasLab = !!lab && lab.components.length > 0;

  // Same calculation + analysis engines used by Projects — no parallel logic.
  const metrics = useMemo(
    () => (lab ? calculateProjectMetrics(lab, { electricityCostPerKwh: lab.electricityCostPerKwh }) : null),
    [lab],
  );
  const analysis = useMemo(() => (lab && metrics ? analyzeArchitecture(lab, metrics) : null), [lab, metrics]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-50">{t('mylab.title')}</h1>
            <p className="mt-1 text-sm text-base-300">{t('mylab.tagline')}</p>
          </div>
          {hasLab && (
            <div className="flex flex-wrap gap-2">
              <Link to={proposalOpen ? '/app/my-lab/proposal' : '/app/my-lab/plan'}>
                <Button leftIcon={<FlaskConical className="w-4 h-4" />}>{proposalOpen ? t('mylab.proposalOpen') : t('mylab.planChange')}</Button>
              </Link>
              <Link to="/app/my-lab/topology">
                <Button variant="secondary" leftIcon={<Workflow className="w-4 h-4" />}>{t('mylab.openTopology')}</Button>
              </Link>
              <Link to="/app/my-lab/report">
                <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />}>{t('mylabreport.title')}</Button>
              </Link>
              <Link to="/app/my-lab/history">
                <Button variant="secondary" leftIcon={<History className="w-4 h-4" />}>{t('mylab.history')}</Button>
              </Link>
              <Link to="/app/my-lab/setup">
                <Button variant="secondary" leftIcon={<Wrench className="w-4 h-4" />}>{t('mylab.runSetupAgain')}</Button>
              </Link>
            </div>
          )}
        </div>

        {!hasLab || !lab || !metrics ? (
          <Card className="mt-8">
            <EmptyState
              icon={<Server className="w-8 h-8" />}
              title={t('mylab.empty.title')}
              description={t('mylab.empty.description')}
              action={
                <Link to="/app/my-lab/setup">
                  <Button leftIcon={<Wrench className="w-4 h-4" />}>{t('mylab.setup.cta')}</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label={t('mylab.stat.devices')} value={metrics.componentCount} icon={<Cpu className="w-4 h-4" />} />
              <StatCard
                label={t('mylab.stat.storage')}
                value={metrics.storage.hasStorageData ? formatStorage(metrics.storage.totalRawStorageTB) : '—'}
                icon={<HardDrive className="w-4 h-4" />}
              />
              <StatCard
                label={t('mylab.stat.power')}
                value={metrics.power.totalKnownPowerWatts > 0 ? formatPower(metrics.power.totalKnownPowerWatts) : '—'}
                icon={<Zap className="w-4 h-4" />}
              />
              <StatCard
                label={t('mylab.stat.cost')}
                value={metrics.cost.totalKnownCost > 0 ? formatCost(metrics.cost.totalKnownCost, lab.currency) : '—'}
                variant="accent"
              />
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Link to="/app/my-lab/health" className="block">
                <Card hover className="p-5 h-full">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-base-50">
                    <Activity className="w-4 h-4 text-accent" />
                    {t('labhealth.title')}
                  </h2>
                  <p className="mt-2 text-xs text-base-300">{t('labhealth.tagline')}</p>
                </Card>
              </Link>
              <Link to="/app/my-lab/checks" className="block">
                <Card hover className="p-5 h-full">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-base-50">
                    <ListChecks className="w-4 h-4 text-accent" />
                    {t('labhealth.checks.title')}
                  </h2>
                  <p className="mt-2 text-xs text-base-300">
                    {analysis && analysis.warnings.length + analysis.criticalIssues.length > 0
                      ? t('labhealth.checks.count', { count: analysis.warnings.length + analysis.criticalIssues.length })
                      : t('labhealth.checks.tagline')}
                  </p>
                </Card>
              </Link>
            </div>

            <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-base-50">
                  <Network className="w-4 h-4 text-accent" />
                  {t('mylab.network')}
                </h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-2xs text-base-400">{t('mylab.connections')}</dt>
                    <dd className="text-base-50 font-mono">{metrics.network.connectionCount}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs text-base-400">{t('mylab.fastestLink')}</dt>
                    <dd className="text-base-50 font-mono">
                      {metrics.network.fastestInterfaceGbps ? formatNetwork(metrics.network.fastestInterfaceGbps) : '—'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-2xs text-base-400">{t('mylab.monthlyEnergy')}</dt>
                    <dd className="text-base-50 font-mono">
                      {metrics.energy.hasPowerData ? `${metrics.energy.monthlyKwh.toFixed(1)} kWh · ${formatCost(metrics.energy.monthlyCost, lab.currency)}` : '—'}
                    </dd>
                  </div>
                </dl>
                <ul className="mt-4 space-y-1.5 max-h-56 overflow-y-auto">
                  {metrics.network.connections.map((c) => (
                    <li key={c.connectionId} className="text-xs text-base-200 flex justify-between gap-2">
                      <span className="truncate">{c.fromName} → {c.toName}</span>
                      <span className="text-base-400 font-mono flex-shrink-0">
                        {c.effectiveSpeedGbps ? formatNetwork(c.effectiveSpeedGbps) : c.connectionType}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-base-50">
                  <Workflow className="w-4 h-4 text-accent" />
                  {t('mylab.architecture')}
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {CATEGORY_ORDER.map((cat) => {
                    const items = lab.components.filter((c) => c.category === cat);
                    if (!items.length) return null;
                    return (
                      <li key={cat} className="text-sm text-base-200">
                        <span className="text-base-400 text-2xs uppercase tracking-wide me-2">{cat}</span>
                        {items.map((i) => i.name).join(', ')}
                      </li>
                    );
                  })}
                </ul>
                {analysis && analysis.warnings.length > 0 && (
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-warning-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t('mylab.notes', { count: analysis.warnings.length })}
                  </p>
                )}
                <Link to="/app/my-lab/topology" className="mt-4 block text-sm font-medium text-accent">
                  {t('mylab.openTopology')} →
                </Link>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
