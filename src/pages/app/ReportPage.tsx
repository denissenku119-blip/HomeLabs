import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Share2, Cpu, HardDrive, Network, Zap, Server, Box,
  CheckCircle2, AlertTriangle, Info, XCircle, Lightbulb, Gauge,
  DollarSign, TrendingUp, Layers, FileText,
} from 'lucide-react';
import type { ProjectComponent, Connection } from '@/types';
import { loadProject } from '@/utils/projectStore';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { analyzeArchitecture } from '@/features/analysis/analysisEngine';
import { buildArchitectureReport } from '@/features/report/reportTypes';
import type { ArchitectureReport } from '@/features/report/reportTypes';
import { formatCost, formatPower, formatStorage, formatNetwork } from '@/utils/calculations';
import { CATEGORY_ICONS, CONNECTION_TYPE_COLORS, CONNECTION_TYPE_LABELS } from '@/data/constants';
import { getCurrencySymbol } from '@/data/currencies';
import { cn } from '@/lib/utils';
import { shareContent } from '@/services/share.service';
import { useI18n } from '@/i18n/I18nContext';
import { formatDateLocale, formatCostLocale } from '@/i18n/formatters';

const SEVERITY_ICONS = {
  good: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
};

const SEVERITY_COLORS = {
  good: { icon: 'text-success-400', text: 'text-success-400', bg: 'bg-success-50/10', border: 'border-success-500/20' },
  warning: { icon: 'text-warning-400', text: 'text-warning-400', bg: 'bg-warning-50/10', border: 'border-warning-500/20' },
  critical: { icon: 'text-danger-400', text: 'text-danger-400', bg: 'bg-danger-50/10', border: 'border-danger-500/20' },
  info: { icon: 'text-base-400', text: 'text-base-300', bg: 'bg-base-850', border: 'border-base-700' },
};

const SEVERITY_LABELS = {
  good: 'severity.good',
  warning: 'severity.warning',
  critical: 'severity.critical',
  info: 'severity.info',
};

const SECTIONS = [
  { id: 'overview', key: 'report.overview' },
  { id: 'blueprint', key: 'report.blueprint' },
  { id: 'hardware', key: 'report.hardware' },
  { id: 'cost', key: 'report.cost' },
  { id: 'power', key: 'report.power' },
  { id: 'storage', key: 'report.storage' },
  { id: 'network', key: 'report.network' },
  { id: 'health', key: 'report.health' },
  { id: 'findings', key: 'report.findings' },
  { id: 'recommendations', key: 'report.recommendations' },
  { id: 'completeness', key: 'report.completeness' },
  { id: 'expansion', key: 'report.expansion' },
  { id: 'notes', key: 'report.notes' },
];

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [activeSection, setActiveSection] = useState('overview');

  const report = useMemo<ArchitectureReport | null>(() => {
    if (!id) return null;
    const project = loadProject(id);
    if (!project) return null;
    const metrics = calculateProjectMetrics(project, {
      electricityCostPerKwh: project.electricityCostPerKwh,
    });
    const analysis = analyzeArchitecture(project, metrics);
    return buildArchitectureReport(
      {
        name: project.name,
        goal: project.goal,
        experienceLevel: project.experienceLevel,
        status: project.status,
        currency: project.currency,
        electricityCostPerKwh: project.electricityCostPerKwh,
        budget: project.budget,
        components: project.components,
        connections: project.connections,
      },
      metrics,
      analysis
    );
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-base-600 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-base-100 mb-2">{t('report.projectNotFound')}</h1>
          <p className="text-sm text-base-400 mb-6">
            {t('report.projectNotFoundDescription')}
          </p>
          <Link
            to="/app/projects"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('report.backToProjects')}
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleShare = async () => {
    await shareContent({
      title: `${report.projectName} — Architecture Report`,
      text: `HomeLab Architect report for ${report.projectName}: ${report.components.length} devices, health score ${report.health.score}/${report.health.maxScore}.`,
    });
  };

  return (
    <div className="min-h-screen bg-base-950">
      {/* Report top bar (hidden in print) */}
      <div className="report-no-print sticky top-0 z-50 flex items-center gap-3 px-4 sm:px-6 py-2.5 bg-base-900 border-b border-base-700">
        <button
          onClick={() => navigate(`/app/project/${id}`)}
          className="flex items-center gap-1.5 text-xs text-base-300 hover:text-base-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('report.backToBuilder')}</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
          aria-label={t('report.printReport')}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('report.printReport')}</span>
          <span className="sm:hidden">{t('report.print')}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-base-700 text-base-200 hover:text-base-50 hover:bg-base-800 transition-colors"
          aria-label="Share report"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Section navigation (hidden in print) */}
      <div className="report-no-print sticky top-[41px] z-40 border-b border-base-700 bg-base-900/95 backdrop-blur">
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 overflow-x-auto">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(`report-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={cn(
                'px-2.5 py-1 text-2xs font-medium rounded-md whitespace-nowrap transition-colors',
                activeSection === section.id
                  ? 'bg-accent/15 text-accent'
                  : 'text-base-400 hover:text-base-200'
              )}
            >
              {t(section.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <ReportHeader report={report} t={t} locale={locale} />
        <div className="h-px bg-base-700 my-8" />

        <Section id="overview" title={t('report.executiveSummary')}>
          <ExecutiveSummary report={report} />
        </Section>

        <Section id="blueprint" title={t('report.architectureBlueprint')}>
          <ReportBlueprint components={report.components} connections={report.connections} />
        </Section>

        <Section id="hardware" title={t('report.hardwareInventory')}>
          <ReportHardware report={report} />
        </Section>

        <Section id="cost" title={t('report.costAnalysis')}>
          <ReportCost report={report} />
        </Section>

        <Section id="power" title={t('report.powerElectricity')}>
          <ReportPower report={report} />
        </Section>

        <Section id="storage" title={t('report.storageAnalysis')}>
          <ReportStorage report={report} />
        </Section>

        <Section id="network" title={t('report.networkArchitecture')}>
          <ReportNetwork report={report} />
        </Section>

        <Section id="health" title={t('report.architectureHealth')}>
          <ReportHealth report={report} />
        </Section>

        <Section id="findings" title={t('report.findings')}>
          <ReportFindings report={report} t={t} />
        </Section>

        <Section id="recommendations" title={t('report.engineeringRecommendations')}>
          <ReportRecommendations report={report} />
        </Section>

        <Section id="completeness" title={t('report.dataCompleteness')}>
          <ReportCompleteness report={report} />
        </Section>

        <Section id="expansion" title={t('report.expansionOutlook')}>
          <ReportExpansion report={report} />
        </Section>

        <Section id="notes" title={t('report.projectNotes')}>
          <ReportNotes report={report} />
        </Section>

        {/* Report footer */}
        <div className="mt-12 pt-6 border-t border-base-700">
          <p className="text-2xs text-base-500 text-center">
            {t('report.generatedBy')} {formatDateLocale(new Date(), locale)}. {t('report.estimatesDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`report-${id}`} className="mb-10 scroll-mt-20 report-section">
      <h2 className="text-sm font-semibold text-base-100 uppercase tracking-wider mb-4 flex items-center gap-2 report-section-title">
        <span className="w-1 h-4 rounded-full bg-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ReportHeader({ report, t, locale }: { report: ArchitectureReport; t: (k: string) => string; locale: string }) {
  const scoreColor = report.health.score >= 70 ? 'text-success-400' : report.health.score >= 50 ? 'text-warning-400' : 'text-danger-400';
  const scoreBg = report.health.score >= 70 ? 'bg-success-500' : report.health.score >= 50 ? 'bg-warning-500' : 'bg-danger-500';
  return (
    <div className="report-header">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/15 text-accent">
          <Cpu className="w-4 h-4" />
        </span>
        <span className="text-xs font-bold text-base-300 uppercase tracking-widest">{t('report.homeLabArchitect')}</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-base-50 mb-1">{report.projectName}</h1>
      <p className="text-sm text-base-400 mb-6">{t('report.architectureReport')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <HeaderStat
          icon={<Gauge className="w-3.5 h-3.5" />}
          label={t('report.architectureHealthLabel')}
          value={report.health.score > 0 ? `${report.health.score} / ${report.health.maxScore}` : '—'}
          valueClass={report.health.score > 0 ? scoreColor : ''}
        >
          {report.health.score > 0 && (
            <div className="mt-1.5 h-1 rounded-full bg-base-800 overflow-hidden">
              <div className={cn('h-full rounded-full', scoreBg)} style={{ width: `${report.health.score}%` }} />
            </div>
          )}
        </HeaderStat>
        <HeaderStat
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label={t('report.estimatedInvestment')}
          value={report.cost.totalKnownCost > 0 ? formatCostLocale(report.cost.totalKnownCost, report.currency, locale) : t('common.unknown')}
        />
        <HeaderStat
          icon={<Server className="w-3.5 h-3.5" />}
          label={t('report.devices')}
          value={String(report.components.length)}
        />
        <HeaderStat
          icon={<FileText className="w-3.5 h-3.5" />}
          label={t('report.generated')}
          value={formatDateLocale(new Date(), locale)}
        />
      </div>
    </div>
  );
}

function HeaderStat({ icon, label, value, valueClass, children }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-base-900 border border-base-700">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base-400">{icon}</span>
        <span className="text-2xs text-base-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn('text-base font-mono font-semibold text-base-100', valueClass)}>{value}</p>
      {children}
    </div>
  );
}

function ExecutiveSummary({ report }: { report: ArchitectureReport }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {report.summary.map((item) => (
        <div key={item.label} className="px-3 py-2.5 rounded-lg bg-base-900 border border-base-700">
          <p className="text-2xs text-base-400 uppercase tracking-wide mb-1">{item.label}</p>
          <p className="text-sm font-mono font-semibold text-base-100">{item.value}</p>
          {item.subLabel && <p className="text-2xs text-base-500 mt-0.5">{item.subLabel}</p>}
        </div>
      ))}
    </div>
  );
}

function ReportBlueprint({ components, connections }: { components: ProjectComponent[]; connections: Connection[] }) {
  if (components.length === 0) {
    return <EmptySection text="No components in this project." />;
  }

  const minX = Math.min(...components.map((c) => c.x));
  const maxX = Math.max(...components.map((c) => c.x + 140));
  const minY = Math.min(...components.map((c) => c.y));
  const maxY = Math.max(...components.map((c) => c.y + 70));
  const width = maxX - minX + 80;
  const height = maxY - minY + 80;
  const offsetX = -minX + 40;
  const offsetY = -minY + 40;

  const compMap = new Map(components.map((c) => [c.instanceId, c]));

  return (
    <div className="rounded-lg border border-base-700 bg-base-900 overflow-hidden">
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          style={{ minWidth: '100%', maxWidth: '1000px' }}
        >
          {/* Connections */}
          {connections.map((conn) => {
            const from = compMap.get(conn.fromId);
            const to = compMap.get(conn.toId);
            if (!from || !to) return null;
            const fx = from.x + offsetX + 70;
            const fy = from.y + offsetY + 35;
            const tx = to.x + offsetX + 70;
            const ty = to.y + offsetY + 35;
            const color = CONNECTION_TYPE_COLORS[conn.type];
            return (
              <g key={conn.id}>
                <line
                  x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  strokeDasharray={conn.type === 'wifi' ? '6 3' : conn.type === 'power' ? '2 2' : undefined}
                />
                <circle cx={tx} cy={ty} r={3} fill={color} fillOpacity={0.7} />
              </g>
            );
          })}

          {/* Nodes */}
          {components.map((comp) => {
            const Icon = CATEGORY_ICONS[comp.category] ?? Box;
            const x = comp.x + offsetX;
            const y = comp.y + offsetY;
            return (
              <g key={comp.instanceId}>
                <rect
                  x={x} y={y} width={140} height={70}
                  rx={8}
                  fill="#171a21"
                  stroke="#2a2f3a"
                  strokeWidth={1}
                />
                <rect x={x} y={y} width={140} height={28} rx={8} fill="#1c2029" />
                <rect x={x} y={y + 20} width={140} height={8} fill="#1c2029" />
                <foreignObject x={x + 8} y={y + 6} width={20} height={20}>
                  <span className="flex items-center justify-center w-5 h-5 rounded text-base-200">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                </foreignObject>
                <text x={x + 32} y={y + 18} fill="#e5e7eb" fontSize={11} fontWeight={600} className="font-sans">
                  {comp.name.length > 18 ? comp.name.slice(0, 17) + '…' : comp.name}
                </text>
                <text x={x + 32} y={y + 40} fill="#6b7280" fontSize={9} className="font-mono">
                  {comp.price > 0 ? formatCost(comp.price, comp.currency) : '—'}
                </text>
                {comp.networkSpeedGbps > 0 && (
                  <text x={x + 32} y={y + 52} fill="#6b7280" fontSize={9} className="font-mono">
                    {formatNetwork(comp.networkSpeedGbps)}
                  </text>
                )}
                {comp.powerWatts > 0 && (
                  <text x={x + 90} y={y + 40} fill="#6b7280" fontSize={9} className="font-mono">
                    {formatPower(comp.powerWatts)}
                  </text>
                )}
                {comp.storageTB > 0 && (
                  <text x={x + 90} y={y + 52} fill="#6b7280" fontSize={9} className="font-mono">
                    {formatStorage(comp.storageTB)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Connection legend */}
      <div className="flex items-center gap-3 px-3 py-2 border-t border-base-700 bg-base-850 flex-wrap">
        {Object.entries(CONNECTION_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full" style={{ background: CONNECTION_TYPE_COLORS[type as keyof typeof CONNECTION_TYPE_COLORS] }} />
            <span className="text-2xs text-base-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportHardware({ report }: { report: ArchitectureReport }) {
  if (report.hardware.length === 0) {
    return <EmptySection text="No hardware in this project." />;
  }
  return (
    <div className="rounded-lg border border-base-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-base-850 border-b border-base-700 text-left">
              <th className="px-3 py-2 font-semibold text-base-300">Device</th>
              <th className="px-3 py-2 font-semibold text-base-300">Category</th>
              <th className="px-3 py-2 font-semibold text-base-300 hidden sm:table-cell">Manufacturer</th>
              <th className="px-3 py-2 font-semibold text-base-300 hidden md:table-cell">Role</th>
              <th className="px-3 py-2 font-semibold text-base-300 text-right">Cost</th>
              <th className="px-3 py-2 font-semibold text-base-300 text-right">Power</th>
              <th className="px-3 py-2 font-semibold text-base-300 text-right hidden sm:table-cell">Network</th>
              <th className="px-3 py-2 font-semibold text-base-300 text-right hidden md:table-cell">Storage</th>
            </tr>
          </thead>
          <tbody>
            {report.hardware.map((item) => {
              const Icon = CATEGORY_ICONS[item.category] ?? Box;
              return (
                <tr key={item.instanceId} className="border-b border-base-800 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-base-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-base-100 truncate">{item.name}</p>
                        <p className="text-2xs text-base-500 truncate sm:hidden">{item.manufacturer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-base-300">{item.categoryLabel}</td>
                  <td className="px-3 py-2 text-base-300 hidden sm:table-cell">{item.manufacturer || '—'}</td>
                  <td className="px-3 py-2 text-base-300 hidden md:table-cell">{item.roleLabel}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {item.isUnknown.price ? <span className="text-base-500">Unknown</span> : <span className="text-accent">{formatCost(item.price, report.currency)}</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {item.isUnknown.power ? <span className="text-base-500">Unknown</span> : <span className="text-base-100">{formatPower(item.powerWatts)}</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono hidden sm:table-cell">
                    {item.isUnknown.network ? <span className="text-base-500">—</span> : <span className="text-base-100">{formatNetwork(item.networkSpeedGbps)}</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono hidden md:table-cell">
                    {item.isUnknown.storage ? <span className="text-base-500">—</span> : <span className="text-base-100">{formatStorage(item.storageTB)}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportCost({ report }: { report: ArchitectureReport }) {
  const { cost } = report;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Cost by Category</h3>
          <div className="flex flex-col gap-2">
            {cost.breakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className="text-base-300">{cat.label}</span>
                <span className="font-mono font-semibold text-base-100">
                  {cat.amount > 0 ? formatCost(cat.amount, report.currency) : '—'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-base-700">
              <span className="text-base-200 font-medium">Total Known</span>
              <span className="font-mono font-bold text-accent">{formatCost(cost.totalKnownCost, report.currency)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Budget & Projections</h3>
          <div className="flex flex-col gap-2">
            {cost.budget != null ? (
              <>
                <Row label="Project budget" value={formatCost(cost.budget, report.currency)} />
                <Row label="Known cost" value={formatCost(cost.totalKnownCost, report.currency)} />
                <Row
                  label={cost.isOverBudget ? 'Over budget by' : 'Remaining'}
                  value={cost.isOverBudget
                    ? formatCost(cost.overAmount ?? 0, report.currency)
                    : formatCost(cost.remaining ?? 0, report.currency)}
                  valueClass={cost.isOverBudget ? 'text-danger-400' : 'text-success-400'}
                />
              </>
            ) : (
              <p className="text-2xs text-base-500">No project budget configured.</p>
            )}
            <div className="h-px bg-base-700 my-1" />
            <Row label="Estimated annual electricity" value={cost.annualElectricityCost != null ? formatCost(cost.annualElectricityCost, report.currency) : 'Unknown'} />
            <Row label="Estimated first-year total" value={cost.firstYearCost != null ? formatCost(cost.firstYearCost, report.currency) : 'Unknown'} valueClass="text-accent font-bold" />
          </div>
        </div>
      </div>

      {cost.hasUnpricedItems && (
        <DisclaimerBox>
          {cost.unpricedComponentCount} component{cost.unpricedComponentCount !== 1 ? 's' : ''} ha{cost.unpricedComponentCount === 1 ? 's' : 've'} no price specified. The total known cost may not represent the full investment.
        </DisclaimerBox>
      )}
    </div>
  );
}

function ReportPower({ report }: { report: ArchitectureReport }) {
  const { power } = report;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricBox label="Known Power" value={power.hasPowerData ? formatPower(power.totalKnownPowerWatts) : 'Unknown'} icon={<Zap className="w-3 h-3" />} />
        <MetricBox label="Est. Idle" value={power.totalIdlePowerWatts != null ? formatPower(power.totalIdlePowerWatts) : 'Unknown'} icon={<Gauge className="w-3 h-3" />} />
        <MetricBox label="Est. Maximum" value={power.totalMaxPowerWatts != null ? formatPower(power.totalMaxPowerWatts) : 'Unknown'} icon={<TrendingUp className="w-3 h-3" />} />
        <MetricBox label="Monthly Energy" value={power.hasPowerData ? `${power.monthlyKwh.toFixed(1)} kWh` : 'Unknown'} icon={<TrendingUp className="w-3 h-3" />} />
      </div>

      <div className="rounded-lg border border-base-700 bg-base-900 p-4">
        <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Electricity Estimates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Row label="Annual consumption" value={power.hasPowerData ? `${Math.round(power.annualKwh).toLocaleString()} kWh` : 'Unknown'} />
            <Row label="Electricity rate" value={`${getCurrencySymbol(report.currency)}${power.electricityCostPerKwh.toFixed(2)}/kWh`} />
            <Row label="Monthly cost" value={power.hasPowerData ? formatCost(power.monthlyCost, report.currency) : 'Unknown'} valueClass="text-accent" />
            <Row label="Annual cost" value={power.hasPowerData ? formatCost(power.annualCost, report.currency) : 'Unknown'} valueClass="text-accent" />
          </div>
          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
            <p className="text-2xs text-base-400 uppercase tracking-wide mb-1">Per-Component Power</p>
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

      <DisclaimerBox>
        Electricity estimates are based on the power assumptions configured for each component and the electricity rate configured for this project. Actual consumption may vary.
      </DisclaimerBox>
    </div>
  );
}

function ReportStorage({ report }: { report: ArchitectureReport }) {
  const { storage } = report;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricBox label="Raw Storage" value={storage.hasStorageData ? formatStorage(storage.totalRawStorageTB) : 'No storage'} icon={<HardDrive className="w-3 h-3" />} />
        <MetricBox label="Storage Devices" value={String(storage.storageDeviceCount)} icon={<HardDrive className="w-3 h-3" />} />
        <MetricBox label="NAS Systems" value={String(storage.nasCount)} icon={<Server className="w-3 h-3" />} />
        <MetricBox label="Known Drive Bays" value={storage.knownDriveBays != null ? String(storage.knownDriveBays) : 'Unknown'} icon={<Layers className="w-3 h-3" />} />
      </div>

      {storage.componentBreakdown.length > 0 && (
        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Storage Devices</h3>
          <div className="flex flex-col gap-1.5">
            {storage.componentBreakdown.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-base-200 truncate">{c.name}</span>
                  {c.driveBays != null && <span className="text-2xs text-base-500 ml-2">{c.driveBays} bays</span>}
                </div>
                <span className={cn('font-mono flex-shrink-0', c.isUnknown ? 'text-base-500' : 'text-base-100')}>
                  {c.isUnknown ? 'Unknown' : formatStorage(c.storageTB)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DisclaimerBox>
        Raw storage is the total disk capacity before RAID, filesystem overhead, or parity. Usable storage will be lower. Usable storage is not calculated in this version.
      </DisclaimerBox>
    </div>
  );
}

function ReportNetwork({ report }: { report: ArchitectureReport }) {
  const { network } = report;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricBox label="Fastest Interface" value={network.fastestInterfaceGbps != null ? formatNetwork(network.fastestInterfaceGbps) : 'Unknown'} icon={<Network className="w-3 h-3" />} />
        <MetricBox label="Connections" value={String(network.connectionCount)} icon={<Network className="w-3 h-3" />} />
        <MetricBox label="Known Links" value={String(network.knownEffectiveLinks)} icon={<CheckCircle2 className="w-3 h-3" />} />
        <MetricBox label="Unknown Links" value={String(network.unknownLinks)} icon={<AlertTriangle className="w-3 h-3" />} valueClass={network.unknownLinks > 0 ? 'text-warning-400' : ''} />
      </div>

      {network.connections.length > 0 && (
        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Connection Details</h3>
          <div className="flex flex-col gap-1.5">
            {network.connections.map((conn, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CONNECTION_TYPE_COLORS[conn.connectionType as keyof typeof CONNECTION_TYPE_COLORS] ?? '#9aa3b2' }} />
                <span className="text-base-200 truncate flex-1 min-w-0">
                  {conn.fromName} ↔ {conn.toName}
                </span>
                <span className="text-2xs text-base-400 flex-shrink-0 hidden sm:inline">
                  {CONNECTION_TYPE_LABELS[conn.connectionType as keyof typeof CONNECTION_TYPE_LABELS] ?? conn.connectionType}
                </span>
                <span className={cn('font-mono flex-shrink-0', conn.isUnknown ? 'text-base-500' : 'text-base-100')}>
                  {conn.isUnknown ? 'Unknown' : formatNetwork(conn.effectiveSpeedGbps!)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {network.bottleneckFindings.length > 0 && (
        <div className="rounded-lg border border-warning-500/20 bg-warning-50/10 p-4">
          <h3 className="text-2xs font-semibold text-warning-400 uppercase tracking-wide mb-2">Potential Bottlenecks</h3>
          <div className="flex flex-col gap-2">
            {network.bottleneckFindings.map((b, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-warning-400">{b.title}</p>
                <p className="text-2xs text-base-300 mt-0.5 leading-relaxed">{b.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportHealth({ report }: { report: ArchitectureReport }) {
  const { health } = report;
  if (health.score === 0) {
    return <EmptySection text="No architecture to analyze. Add components to receive a health score." />;
  }

  const scoreColor = health.score >= 70 ? 'text-success-400' : health.score >= 50 ? 'text-warning-400' : 'text-danger-400';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-lg border border-base-700 bg-base-900 p-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-base-850 border border-base-700 flex-shrink-0">
          <Gauge className={cn('w-7 h-7', scoreColor)} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-2xl font-bold font-mono', scoreColor)}>{health.score}</span>
            <span className="text-sm text-base-400 font-mono">/ {health.maxScore}</span>
          </div>
          <p className="text-xs font-medium text-base-200">{health.label}</p>
        </div>
      </div>

      <div className="rounded-lg border border-base-700 bg-base-900 p-4">
        <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-3">Category Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {health.scoreBreakdown.map((cat) => {
            const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
            return (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="text-xs text-base-300 w-28 flex-shrink-0 truncate">{cat.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-base-800 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', pct >= 70 ? 'bg-success-500' : pct >= 40 ? 'bg-warning-500' : 'bg-danger-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-base-200 w-8 text-right flex-shrink-0">{cat.score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportFindings({ report, t }: { report: ArchitectureReport; t: (k: string) => string }) {
  if (report.findings.length === 0) {
    return <EmptySection text="No findings to report." />;
  }

  const grouped: Record<string, typeof report.findings> = {
    critical: [],
    warning: [],
    good: [],
    info: [],
  };
  for (const f of report.findings) {
    grouped[f.severity]?.push(f);
  }

  const order = ['critical', 'warning', 'good', 'info'] as const;

  return (
    <div className="flex flex-col gap-4">
      {order.map((sev) => {
        const items = grouped[sev];
        if (!items || items.length === 0) return null;
        return (
          <div key={sev}>
            <h3 className={cn('text-2xs font-bold uppercase tracking-wider mb-2', SEVERITY_COLORS[sev].text)}>
              {t(SEVERITY_LABELS[sev])} ({items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {items.map((f) => {
                const Icon = SEVERITY_ICONS[sev];
                const colors = SEVERITY_COLORS[sev];
                return (
                  <div key={f.id} className={cn('rounded-md border px-3 py-2.5', colors.bg, colors.border)}>
                    <div className="flex items-start gap-2">
                      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', colors.icon)} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-xs font-medium', colors.text)}>{f.title}</p>
                        <p className="text-2xs text-base-300 mt-1 leading-relaxed">{f.explanation}</p>
                        {f.recommendation && (
                          <p className="text-2xs text-base-400 mt-1.5 italic">
                            Recommendation: {f.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportRecommendations({ report }: { report: ArchitectureReport }) {
  if (report.recommendations.length === 0) {
    return <EmptySection text="No recommendations at this time." />;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {report.recommendations.map((rec, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border border-base-700 bg-base-900 p-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/15 text-accent text-xs font-bold font-mono flex-shrink-0">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-base-100">{rec.title}</p>
            <p className="text-2xs text-base-400 mt-1 leading-relaxed">Why: {rec.explanation}</p>
            {rec.recommendation && (
              <div className="flex items-start gap-1.5 mt-1.5">
                <Lightbulb className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-base-200 leading-relaxed">{rec.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportCompleteness({ report }: { report: ArchitectureReport }) {
  if (report.completeness.length === 0) {
    return (
      <div className="rounded-lg border border-success-500/20 bg-success-50/10 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success-400" />
          <p className="text-xs text-success-400 font-medium">All available data is configured.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {report.completeness.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-base-700 bg-base-900 p-3">
          <Info className="w-3.5 h-3.5 text-base-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-base-200">{item.label}</p>
            <p className="text-2xs text-base-400 mt-0.5 leading-relaxed">{item.detail}</p>
          </div>
        </div>
      ))}
      <DisclaimerBox>
        Missing data does not automatically indicate an architecture problem. It means there is not enough information to fully evaluate this aspect of the design.
      </DisclaimerBox>
    </div>
  );
}

function ReportExpansion({ report }: { report: ArchitectureReport }) {
  if (report.expansion.length === 0) {
    return <EmptySection text="No expansion data available. Add networking or storage hardware to see expansion outlook." />;
  }
  return (
    <div className="flex flex-col gap-2">
      {report.expansion.map((item, i) => (
        <div key={i} className={cn(
          'flex items-start gap-2 rounded-lg border p-3',
          item.isPositive ? 'border-success-500/20 bg-success-50/10' : 'border-base-700 bg-base-900'
        )}>
          {item.isPositive ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-success-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-3.5 h-3.5 text-base-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={cn('text-xs font-medium', item.isPositive ? 'text-success-400' : 'text-base-200')}>{item.label}</p>
            <p className="text-2xs text-base-400 mt-0.5 leading-relaxed">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportNotes({ report }: { report: ArchitectureReport }) {
  if (!report.projectNotes) {
    return <EmptySection text="No project notes added." />;
  }
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-4">
      <p className="text-xs text-base-200 leading-relaxed whitespace-pre-wrap">{report.projectNotes}</p>
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-6 text-center">
      <p className="text-xs text-base-400">{text}</p>
    </div>
  );
}

function MetricBox({ label, value, icon, valueClass }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-base-900 border border-base-700">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base-400">{icon}</span>
        <span className="text-2xs text-base-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn('text-sm font-mono font-semibold text-base-100', valueClass)}>{value}</p>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-base-300">{label}</span>
      <span className={cn('font-mono', valueClass ?? 'text-base-100')}>{value}</span>
    </div>
  );
}

function DisclaimerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-base-850 border border-base-700">
      <Info className="w-3.5 h-3.5 text-base-400 flex-shrink-0 mt-0.5" />
      <p className="text-2xs text-base-400 leading-relaxed">{children}</p>
    </div>
  );
}
