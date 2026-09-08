import { useState, useMemo } from 'react';
import {
  Cpu, Zap, HardDrive, Network, DollarSign, TrendingUp,
  ChevronDown, ChevronUp, Info, AlertTriangle, Battery, Gauge, Plug,
} from 'lucide-react';
import type { ProjectComponent, Connection, Currency } from '@/types';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import type { ProjectMetrics } from '@/features/calculations/types';
import { CATEGORY_LABELS } from '@/features/calculations/costCalculations';
import { formatCost, formatPower, formatStorage, formatNetwork } from '@/utils/calculations';
import { CURRENCY_SYMBOLS } from '@/data/constants';
import { cn } from '@/lib/utils';

interface ProjectSummaryProps {
  components: ProjectComponent[];
  connections: Connection[];
  currency: Currency;
  electricityCostPerKwh: number;
  budget?: number;
  saved: boolean;
}

type MetricKey = 'investment' | 'power' | 'energy' | 'storage' | 'network' | null;

export function ProjectSummary({
  components, connections, currency, electricityCostPerKwh, budget, saved,
}: ProjectSummaryProps) {
  const [expandedMetric, setExpandedMetric] = useState<MetricKey>(null);

  const metrics = useMemo(
    () => calculateProjectMetrics(
      {
        id: 'summary',
        name: 'Summary',
        goal: 'other',
        experienceLevel: 'beginner',
        currency,
        electricityCostPerKwh,
        budget,
        status: 'draft',
        components,
        connections,
        createdAt: '',
        updatedAt: '',
      },
      { electricityCostPerKwh }
    ),
    [components, connections, currency, electricityCostPerKwh, budget]
  );

  const toggleMetric = (key: Exclude<MetricKey, null>) =>
    setExpandedMetric((prev) => (prev === key ? null : key));

  const primaryMetrics = getPrimaryMetrics(metrics, currency);
  const secondaryMetrics = getSecondaryMetrics(metrics);

  return (
    <div className="border-t border-base-700 bg-base-900 flex-shrink-0">
      {/* Primary metrics bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {primaryMetrics.map((m) => (
            <MetricButton
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={m.value}
              accent={m.accent}
              active={expandedMetric === m.key}
              onClick={() => toggleMetric(m.key)}
              warning={m.warning}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-auto">
          {secondaryMetrics.map((m) => (
            <div key={m.label} className="flex items-center gap-1.5">
              <span className="text-base-400">{m.icon}</span>
              <div className="flex flex-col leading-tight">
                <span className="text-2xs text-base-400 uppercase tracking-wide">{m.label}</span>
                <span className="text-xs font-mono font-semibold text-base-200">{m.value}</span>
              </div>
            </div>
          ))}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 text-2xs font-medium rounded-full border flex-shrink-0',
              saved
                ? 'bg-success-50/40 text-success-400 border-success-500/30'
                : 'bg-base-800 text-base-300 border-base-600'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', saved ? 'bg-success-400' : 'bg-base-400 animate-pulse-subtle')} />
            {saved ? 'Saved' : 'Saving...'}
          </span>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expandedMetric && (
        <div className="px-3 sm:px-4 py-3 border-t border-base-700 bg-base-850 max-h-[280px] overflow-y-auto">
          {expandedMetric === 'investment' && <InvestmentDetail metrics={metrics} currency={currency} />}
          {expandedMetric === 'power' && <PowerDetail metrics={metrics} />}
          {expandedMetric === 'energy' && <EnergyDetail metrics={metrics} currency={currency} />}
          {expandedMetric === 'storage' && <StorageDetail metrics={metrics} />}
          {expandedMetric === 'network' && <NetworkDetail metrics={metrics} />}
        </div>
      )}
    </div>
  );
}

interface PrimaryMetric {
  key: Exclude<MetricKey, null>;
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
}

function getPrimaryMetrics(metrics: ProjectMetrics, currency: Currency): PrimaryMetric[] {
  return [
    {
      key: 'investment',
      icon: <DollarSign className="w-3.5 h-3.5" />,
      label: 'Est. Investment',
      value: metrics.cost.totalKnownCost > 0 ? formatCost(metrics.cost.totalKnownCost, currency) : '—',
      accent: true,
      warning: metrics.cost.unpricedComponentCount > 0,
    },
    {
      key: 'power',
      icon: <Zap className="w-3.5 h-3.5" />,
      label: 'Est. Power',
      value: metrics.power.totalKnownPowerWatts > 0
        ? formatPower(metrics.power.totalKnownPowerWatts)
        : '—',
      warning: metrics.power.unknownPowerCount > 0,
    },
    {
      key: 'energy',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      label: 'Annual Energy',
      value: metrics.energy.hasPowerData
        ? `${Math.round(metrics.energy.annualKwh).toLocaleString()} kWh`
        : '—',
    },
    {
      key: 'storage',
      icon: <HardDrive className="w-3.5 h-3.5" />,
      label: 'Raw Storage',
      value: metrics.storage.hasStorageData
        ? formatStorage(metrics.storage.totalRawStorageTB)
        : '—',
    },
    {
      key: 'network',
      icon: <Network className="w-3.5 h-3.5" />,
      label: 'Network',
      value: metrics.network.fastestInterfaceGbps != null
        ? formatNetwork(metrics.network.fastestInterfaceGbps)
        : metrics.network.connectionCount > 0
          ? `${metrics.network.connectionCount} links`
          : '—',
    },
  ];
}

function getSecondaryMetrics(metrics: ProjectMetrics): { icon: React.ReactNode; label: string; value: string }[] {
  const result: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <Cpu className="w-3.5 h-3.5" />,
      label: 'Components',
      value: String(metrics.componentCount),
    },
  ];

  if (metrics.cost.unpricedComponentCount > 0) {
    result.push({
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: 'Unpriced',
      value: String(metrics.cost.unpricedComponentCount),
    });
  }

  if (metrics.power.unknownPowerCount > 0) {
    result.push({
      icon: <Info className="w-3.5 h-3.5" />,
      label: 'Unknown Power',
      value: String(metrics.power.unknownPowerCount),
    });
  }

  return result;
}

function MetricButton({
  icon, label, value, accent, active, onClick, warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  active: boolean;
  onClick: () => void;
  warning?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-1.5 py-0.5 rounded-md transition-colors',
        active && 'bg-base-800'
      )}
      aria-expanded={active}
    >
      <span className={cn('text-base-400', warning && 'text-warning-400')}>{icon}</span>
      <div className="flex flex-col leading-tight text-left">
        <span className="text-2xs text-base-400 uppercase tracking-wide flex items-center gap-0.5">
          {label}
          {active ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
        </span>
        <span className={cn(
          'text-xs font-mono font-semibold',
          accent ? 'text-accent' : 'text-base-100',
          warning && 'text-warning-400'
        )}>
          {value}
        </span>
      </div>
    </button>
  );
}

function DetailHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-semibold text-base-100">{title}</h3>
      {subtitle && <p className="text-2xs text-base-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function UnknownNote({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-warning-50/10 border border-warning-500/20 mt-2">
      <Info className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
      <p className="text-2xs text-warning-400/90 leading-relaxed">
        {count} {label} — actual totals may be higher.
      </p>
    </div>
  );
}

function InvestmentDetail({ metrics, currency }: { metrics: ProjectMetrics; currency: Currency }) {
  const { cost, budget } = metrics;

  return (
    <div>
      <DetailHeader title="Investment Breakdown" subtitle="Based on known component prices" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          {cost.breakdown.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <span className="text-base-300">{CATEGORY_LABELS[item.category]}</span>
              <span className="font-mono font-semibold text-base-100">
                {item.amount > 0 ? formatCost(item.amount, currency) : '—'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-700">
            <span className="text-base-200 font-medium">Total Known</span>
            <span className="font-mono font-bold text-accent">
              {formatCost(cost.totalKnownCost, currency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Priced components</span>
            <span className="font-mono text-base-100">{cost.knownComponentCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Unpriced components</span>
            <span className="font-mono text-base-100">{cost.unpricedComponentCount}</span>
          </div>
          {budget.budget != null && (
            <>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-700">
                <span className="text-base-300">Budget</span>
                <span className="font-mono text-base-100">{formatCost(budget.budget, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-300">
                  {budget.isOverBudget ? 'Over budget by' : 'Remaining'}
                </span>
                <span className={cn(
                  'font-mono font-semibold',
                  budget.isOverBudget ? 'text-danger-400' : 'text-success-400'
                )}>
                  {budget.isOverBudget
                    ? formatCost(budget.overAmount ?? 0, currency)
                    : formatCost(budget.remaining ?? 0, currency)}
                </span>
              </div>
              {budget.hasUnpricedItems && (
                <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-warning-50/10 border border-warning-500/20">
                  <AlertTriangle className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
                  <p className="text-2xs text-warning-400/90 leading-relaxed">
                    {budget.unpricedCount} component{budget.unpricedCount !== 1 ? 's' : ''} unpriced —
                    your architecture may exceed the budget.
                  </p>
                </div>
              )}
            </>
          )}
          <UnknownNote count={cost.unpricedComponentCount} label="components have no price" />
        </div>
      </div>
    </div>
  );
}

function PowerDetail({ metrics }: { metrics: ProjectMetrics }) {
  const { power } = metrics;

  return (
    <div>
      <DetailHeader title="Power Breakdown" subtitle="Estimated continuous power consumption" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Known estimated
            </span>
            <span className="font-mono font-bold text-base-100">
              {power.totalKnownPowerWatts > 0 ? formatPower(power.totalKnownPowerWatts) : '—'}
            </span>
          </div>
          {power.hasIdleData && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-300 flex items-center gap-1.5">
                <Battery className="w-3 h-3" /> Estimated idle
              </span>
              <span className="font-mono text-base-100">{formatPower(power.totalIdlePowerWatts!)}</span>
            </div>
          )}
          {power.hasMaxData && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-300 flex items-center gap-1.5">
                <Gauge className="w-3 h-3" /> Estimated max
              </span>
              <span className="font-mono text-base-100">{formatPower(power.totalMaxPowerWatts!)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Components with power data</span>
            <span className="font-mono text-base-100">{power.knownComponentCount}</span>
          </div>
          <UnknownNote count={power.unknownPowerCount} label="components have no power data" />
        </div>

        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
          {power.componentBreakdown.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-2xs">
              <span className="text-base-300 truncate">{c.name}</span>
              <span className={cn('font-mono flex-shrink-0 ml-2', c.isUnknown ? 'text-base-500' : 'text-base-100')}>
                {c.isUnknown ? 'Unknown' : formatPower(c.powerWatts)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnergyDetail({ metrics, currency }: { metrics: ProjectMetrics; currency: Currency }) {
  const { energy } = metrics;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';

  return (
    <div>
      <DetailHeader title="Energy Estimation" subtitle="Based on continuous 24/7 operation" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Continuous power</span>
            <span className="font-mono text-base-100">
              {energy.estimatedContinuousPowerWatts > 0 ? formatPower(energy.estimatedContinuousPowerWatts) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Monthly consumption</span>
            <span className="font-mono text-base-100">
              {energy.hasPowerData ? `${energy.monthlyKwh.toFixed(1)} kWh` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Annual consumption</span>
            <span className="font-mono text-base-100">
              {energy.hasPowerData ? `${Math.round(energy.annualKwh).toLocaleString()} kWh` : '—'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300 flex items-center gap-1.5">
              <Plug className="w-3 h-3" /> Electricity rate
            </span>
            <span className="font-mono text-base-100">
              {symbol}{energy.electricityCostPerKwh.toFixed(2)}/kWh
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Monthly cost</span>
            <span className="font-mono font-semibold text-accent">
              {energy.hasPowerData ? formatCost(energy.monthlyCost, currency) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Annual cost</span>
            <span className="font-mono font-semibold text-accent">
              {energy.hasPowerData ? formatCost(energy.annualCost, currency) : '—'}
            </span>
          </div>
          {metrics.firstYearCost != null && metrics.firstYearCost > 0 && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-700">
              <span className="text-base-200 font-medium">Est. first-year cost</span>
              <span className="font-mono font-bold text-accent">
                {formatCost(metrics.firstYearCost, currency)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-base-800 border border-base-700 mt-2">
        <Info className="w-3 h-3 text-base-400 flex-shrink-0 mt-0.5" />
        <p className="text-2xs text-base-400 leading-relaxed">
          Power and energy figures are estimates based on the component values in your architecture.
          {energy.unknownPowerCount > 0 && ' Some components do not have power data, so actual consumption may be higher.'}
        </p>
      </div>
    </div>
  );
}

function StorageDetail({ metrics }: { metrics: ProjectMetrics }) {
  const { storage } = metrics;

  return (
    <div>
      <DetailHeader title="Storage Breakdown" subtitle="Raw storage capacity — not usable capacity" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Total raw storage</span>
            <span className="font-mono font-bold text-base-100">
              {storage.hasStorageData ? formatStorage(storage.totalRawStorageTB) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Storage devices</span>
            <span className="font-mono text-base-100">{storage.storageDeviceCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">NAS systems</span>
            <span className="font-mono text-base-100">{storage.nasCount}</span>
          </div>
          {storage.knownDriveBays != null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-300">Known drive bays</span>
              <span className="font-mono text-base-100">{storage.knownDriveBays}</span>
            </div>
          )}
          <UnknownNote count={storage.unknownStorageCount} label="storage components lack capacity data" />
        </div>

        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
          {storage.componentBreakdown.length > 0 ? (
            storage.componentBreakdown.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-2xs">
                <span className="text-base-300 truncate">{c.name}</span>
                <span className={cn('font-mono flex-shrink-0 ml-2', c.isUnknown ? 'text-base-500' : 'text-base-100')}>
                  {c.isUnknown ? 'Unknown' : formatStorage(c.storageTB)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-2xs text-base-500">No storage components in project.</p>
          )}
        </div>
      </div>
      <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-base-800 border border-base-700 mt-2">
        <Info className="w-3 h-3 text-base-400 flex-shrink-0 mt-0.5" />
        <p className="text-2xs text-base-400 leading-relaxed">
          Raw storage is the total disk capacity before RAID, filesystem overhead, or parity.
          Usable storage will be lower. RAID calculations will be available in a future update.
        </p>
      </div>
    </div>
  );
}

function NetworkDetail({ metrics }: { metrics: ProjectMetrics }) {
  const { network } = metrics;

  return (
    <div>
      <DetailHeader title="Network Summary" subtitle="Effective link speeds based on connections" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Fastest interface</span>
            <span className="font-mono font-semibold text-base-100">
              {network.fastestInterfaceGbps != null ? formatNetwork(network.fastestInterfaceGbps) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Network-capable devices</span>
            <span className="font-mono text-base-100">{network.networkCapableCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Connections</span>
            <span className="font-mono text-base-100">{network.connectionCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-300">Known effective links</span>
            <span className="font-mono text-base-100">{network.knownEffectiveLinks}</span>
          </div>
          {network.unknownLinks > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-300">Unknown links</span>
              <span className="font-mono text-warning-400">{network.unknownLinks}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
          {network.connections.length > 0 ? (
            network.connections.map((conn) => (
              <div key={conn.connectionId} className="flex items-center justify-between text-2xs">
                <span className="text-base-300 truncate">
                  {conn.fromName} ↔ {conn.toName}
                </span>
                <span className={cn('font-mono flex-shrink-0 ml-2', conn.isUnknown ? 'text-base-500' : 'text-base-100')}>
                  {conn.isUnknown ? 'Unknown' : formatNetwork(conn.effectiveSpeedGbps!)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-2xs text-base-500">No connections in project.</p>
          )}
        </div>
      </div>
    </div>
  );
}
