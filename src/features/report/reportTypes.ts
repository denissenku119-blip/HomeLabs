import type { ProjectComponent, Connection, Currency, ComponentCategory } from '@/types';
import type { ProjectMetrics } from '@/features/calculations/types';
import type { ArchitectureAnalysis } from '@/features/analysis/types';
import type { ComponentRole } from '@/features/analysis/types';

export interface ReportSummaryItem {
  label: string;
  value: string;
  subLabel?: string;
}

export interface ReportHardwareItem {
  instanceId: string;
  name: string;
  category: ComponentCategory;
  categoryLabel: string;
  manufacturer: string;
  model: string;
  role: ComponentRole;
  roleLabel: string;
  price: number;
  powerWatts: number;
  storageTB: number;
  networkSpeedGbps: number;
  formFactor: string;
  hasOverrides: boolean;
  isUnknown: {
    price: boolean;
    power: boolean;
    storage: boolean;
    network: boolean;
  };
}

export interface ReportCostCategory {
  category: ComponentCategory;
  label: string;
  amount: number;
  componentCount: number;
}

export interface ReportCostSummary {
  totalKnownCost: number;
  currency: Currency;
  knownComponentCount: number;
  unpricedComponentCount: number;
  unpricedComponents: string[];
  breakdown: ReportCostCategory[];
  budget: number | null;
  remaining: number | null;
  isOverBudget: boolean;
  overAmount: number | null;
  hasUnpricedItems: boolean;
  firstYearCost: number | null;
  annualElectricityCost: number | null;
}

export interface ReportPowerSummary {
  totalKnownPowerWatts: number;
  knownComponentCount: number;
  unknownPowerCount: number;
  unknownPowerComponents: string[];
  totalIdlePowerWatts: number | null;
  totalMaxPowerWatts: number | null;
  monthlyKwh: number;
  annualKwh: number;
  electricityCostPerKwh: number;
  monthlyCost: number;
  annualCost: number;
  currency: Currency;
  hasPowerData: boolean;
  componentBreakdown: { name: string; powerWatts: number; isUnknown: boolean }[];
}

export interface ReportStorageSummary {
  totalRawStorageTB: number;
  hasStorageData: boolean;
  unknownStorageCount: number;
  storageDeviceCount: number;
  nasCount: number;
  knownDriveBays: number | null;
  unknownDriveBaysCount: number;
  componentBreakdown: { name: string; storageTB: number; driveBays?: number; isUnknown: boolean }[];
}

export interface ReportNetworkConnection {
  fromName: string;
  toName: string;
  effectiveSpeedGbps: number | null;
  isUnknown: boolean;
  connectionType: string;
}

export interface ReportNetworkSummary {
  fastestInterfaceGbps: number | null;
  networkCapableCount: number;
  unknownNetworkCount: number;
  connectionCount: number;
  knownEffectiveLinks: number;
  unknownLinks: number;
  connections: ReportNetworkConnection[];
  bottleneckFindings: { title: string; explanation: string }[];
}

export interface ReportHealthSummary {
  score: number;
  maxScore: number;
  label: string;
  scoreBreakdown: { category: string; label: string; score: number; maxScore: number }[];
}

export interface ReportFinding {
  id: string;
  severity: 'info' | 'good' | 'warning' | 'critical';
  category: string;
  title: string;
  explanation: string;
  recommendation?: string;
}

export interface ReportRecommendation {
  title: string;
  explanation: string;
  recommendation: string;
  severity: 'info' | 'good' | 'warning' | 'critical';
}

export interface ReportExpansionItem {
  label: string;
  detail: string;
  isPositive: boolean;
}

export interface ReportCompletenessItem {
  label: string;
  detail: string;
}

export interface ArchitectureReport {
  projectName: string;
  projectDescription: string;
  goal: string;
  experienceLevel: string;
  status: string;
  currency: Currency;
  generatedDate: string;
  components: ProjectComponent[];
  connections: Connection[];
  summary: ReportSummaryItem[];
  hardware: ReportHardwareItem[];
  cost: ReportCostSummary;
  power: ReportPowerSummary;
  storage: ReportStorageSummary;
  network: ReportNetworkSummary;
  health: ReportHealthSummary;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  completeness: ReportCompletenessItem[];
  expansion: ReportExpansionItem[];
  projectNotes: string | null;
  isEmpty: boolean;
}

const ROLE_LABELS: Record<ComponentRole, string> = {
  router: 'Router',
  switch: 'Switch',
  compute: 'Compute',
  storage: 'Storage',
  backup: 'Backup',
  'power-protection': 'Power Protection',
  'access-point': 'Access Point',
  firewall: 'Firewall',
  other: 'Other',
};

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  compute: 'Compute',
  storage: 'Storage',
  networking: 'Networking',
  power: 'Power',
  virtualization: 'Virtualization',
  security: 'Security',
  other: 'Other',
};

function detectRole(comp: ProjectComponent): ComponentRole {
  const name = comp.name.toLowerCase();
  const sub = comp.subcategory?.toLowerCase() ?? '';
  const cat = comp.category;
  const useCases = comp.useCases.map((u) => u.toLowerCase()).join(' ');

  if (cat === 'power' || sub === 'ups' || sub === 'pdu') return 'power-protection';
  if (cat === 'networking' || cat === 'security') {
    if (sub.includes('router') || name.includes('router')) return 'router';
    if (sub.includes('firewall') || name.includes('firewall') || name.includes('pfsense') || name.includes('opnsense')) return 'firewall';
    if (sub.includes('access point') || sub.includes('wi-fi') || name.includes('access point')) return 'access-point';
    if (sub.includes('switch') || name.includes('switch')) return 'switch';
    return cat === 'security' ? 'firewall' : 'other';
  }
  if (cat === 'storage') {
    if (sub.includes('external') || name.includes('backup') || name.includes('usb') || useCases.includes('backup')) return 'backup';
    return 'storage';
  }
  if (cat === 'compute' || cat === 'virtualization') return 'compute';
  if (cat === 'other' && (name.includes('backup') || useCases.includes('backup'))) return 'backup';
  return 'other';
}

export function buildArchitectureReport(
  project: {
    name: string;
    goal: string;
    experienceLevel: string;
    status: string;
    currency: Currency;
    electricityCostPerKwh: number;
    budget?: number;
    components: ProjectComponent[];
    connections: Connection[];
  },
  metrics: ProjectMetrics,
  analysis: ArchitectureAnalysis
): ArchitectureReport {
  const { components, connections, currency } = project;

  const hardware: ReportHardwareItem[] = components.map((comp) => {
    const role = detectRole(comp);
    return {
      instanceId: comp.instanceId,
      name: comp.name,
      category: comp.category,
      categoryLabel: CATEGORY_LABELS[comp.category],
      manufacturer: comp.manufacturer,
      model: comp.model,
      role,
      roleLabel: ROLE_LABELS[role],
      price: comp.price,
      powerWatts: comp.powerWatts,
      storageTB: comp.storageTB,
      networkSpeedGbps: comp.networkSpeedGbps,
      formFactor: comp.formFactor,
      hasOverrides: comp.hasOverrides ?? false,
      isUnknown: {
        price: comp.price <= 0,
        power: comp.powerWatts <= 0,
        storage: comp.storageTB <= 0,
        network: comp.networkSpeedGbps <= 0,
      },
    };
  });

  const summary: ReportSummaryItem[] = [
    { label: 'Devices', value: String(metrics.componentCount) },
    { label: 'Connections', value: String(metrics.network.connectionCount) },
    {
      label: 'Estimated Investment',
      value: metrics.cost.totalKnownCost > 0
        ? formatCostValue(metrics.cost.totalKnownCost, currency)
        : 'Unknown',
      subLabel: metrics.cost.unpricedComponentCount > 0
        ? `${metrics.cost.unpricedComponentCount} unpriced`
        : undefined,
    },
    {
      label: 'Monthly Electricity',
      value: metrics.energy.hasPowerData
        ? formatCostValue(metrics.energy.monthlyCost, currency)
        : 'Unknown',
    },
    {
      label: 'Raw Storage',
      value: metrics.storage.hasStorageData
        ? formatStorageValue(metrics.storage.totalRawStorageTB)
        : 'No storage',
    },
    {
      label: 'Primary Network',
      value: metrics.network.fastestInterfaceGbps != null
        ? formatNetworkValue(metrics.network.fastestInterfaceGbps)
        : 'Unknown',
    },
    {
      label: 'Architecture Health',
      value: `${analysis.score} / ${analysis.maxScore}`,
      subLabel: analysis.label,
    },
  ];

  const cost: ReportCostSummary = {
    totalKnownCost: metrics.cost.totalKnownCost,
    currency,
    knownComponentCount: metrics.cost.knownComponentCount,
    unpricedComponentCount: metrics.cost.unpricedComponentCount,
    unpricedComponents: metrics.cost.unpricedComponents,
    breakdown: metrics.cost.breakdown.map((b) => ({
      category: b.category,
      label: CATEGORY_LABELS[b.category],
      amount: b.amount,
      componentCount: b.componentCount,
    })),
    budget: metrics.budget.budget,
    remaining: metrics.budget.remaining,
    isOverBudget: metrics.budget.isOverBudget,
    overAmount: metrics.budget.overAmount,
    hasUnpricedItems: metrics.budget.hasUnpricedItems,
    firstYearCost: metrics.firstYearCost,
    annualElectricityCost: metrics.energy.hasPowerData ? metrics.energy.annualCost : null,
  };

  const power: ReportPowerSummary = {
    totalKnownPowerWatts: metrics.power.totalKnownPowerWatts,
    knownComponentCount: metrics.power.knownComponentCount,
    unknownPowerCount: metrics.power.unknownPowerCount,
    unknownPowerComponents: metrics.power.unknownPowerComponents,
    totalIdlePowerWatts: metrics.power.totalIdlePowerWatts,
    totalMaxPowerWatts: metrics.power.totalMaxPowerWatts,
    monthlyKwh: metrics.energy.monthlyKwh,
    annualKwh: metrics.energy.annualKwh,
    electricityCostPerKwh: metrics.energy.electricityCostPerKwh,
    monthlyCost: metrics.energy.monthlyCost,
    annualCost: metrics.energy.annualCost,
    currency,
    hasPowerData: metrics.energy.hasPowerData,
    componentBreakdown: metrics.power.componentBreakdown,
  };

  const storage: ReportStorageSummary = {
    totalRawStorageTB: metrics.storage.totalRawStorageTB,
    hasStorageData: metrics.storage.hasStorageData,
    unknownStorageCount: metrics.storage.unknownStorageCount,
    storageDeviceCount: metrics.storage.storageDeviceCount,
    nasCount: metrics.storage.nasCount,
    knownDriveBays: metrics.storage.knownDriveBays,
    unknownDriveBaysCount: metrics.storage.unknownDriveBaysCount,
    componentBreakdown: metrics.storage.componentBreakdown,
  };

  const network: ReportNetworkSummary = {
    fastestInterfaceGbps: metrics.network.fastestInterfaceGbps,
    networkCapableCount: metrics.network.networkCapableCount,
    unknownNetworkCount: metrics.network.unknownNetworkCount,
    connectionCount: metrics.network.connectionCount,
    knownEffectiveLinks: metrics.network.knownEffectiveLinks,
    unknownLinks: metrics.network.unknownLinks,
    connections: metrics.network.connections.map((c) => ({
      fromName: c.fromName,
      toName: c.toName,
      effectiveSpeedGbps: c.effectiveSpeedGbps,
      isUnknown: c.isUnknown,
      connectionType: c.connectionType,
    })),
    bottleneckFindings: analysis.bottlenecks.map((f) => ({
      title: f.title,
      explanation: f.explanation,
    })),
  };

  const health: ReportHealthSummary = {
    score: analysis.score,
    maxScore: analysis.maxScore,
    label: analysis.label,
    scoreBreakdown: analysis.scoreBreakdown.map((s) => ({
      category: s.category,
      label: s.label,
      score: s.score,
      maxScore: s.maxScore,
    })),
  };

  const findings: ReportFinding[] = analysis.allFindings.map((f) => ({
    id: f.id,
    severity: f.severity,
    category: f.category,
    title: f.title,
    explanation: f.explanation,
    recommendation: f.recommendation,
  }));

  const recommendations: ReportRecommendation[] = analysis.recommendations.map((f) => ({
    title: f.title,
    explanation: f.explanation,
    recommendation: f.recommendation ?? '',
    severity: f.severity,
  }));

  const completeness: ReportCompletenessItem[] = [];
  if (metrics.cost.unpricedComponentCount > 0) {
    completeness.push({
      label: 'Hardware cost missing',
      detail: `${metrics.cost.unpricedComponentCount} component${metrics.cost.unpricedComponentCount !== 1 ? 's' : ''} ha${metrics.cost.unpricedComponentCount === 1 ? 's' : 've'} no price specified.`,
    });
  }
  if (metrics.power.unknownPowerCount > 0) {
    completeness.push({
      label: 'Power consumption unknown',
      detail: `${metrics.power.unknownPowerCount} component${metrics.power.unknownPowerCount !== 1 ? 's' : ''} ha${metrics.power.unknownPowerCount === 1 ? 's' : 've'} no power estimate.`,
    });
  }
  if (metrics.network.unknownNetworkCount > 0) {
    completeness.push({
      label: 'Network speed unknown',
      detail: `Network capability is unknown for ${metrics.network.unknownNetworkCount} component${metrics.network.unknownNetworkCount !== 1 ? 's' : ''}.`,
    });
  }
  if (metrics.network.unknownLinks > 0) {
    completeness.push({
      label: 'Connection speed unknown',
      detail: `${metrics.network.unknownLinks} connection${metrics.network.unknownLinks !== 1 ? 's' : ''} ha${metrics.network.unknownLinks === 1 ? 's' : 've'} unknown effective speed.`,
    });
  }
  if (!metrics.energy.hasPowerData && metrics.energy.unknownPowerCount > 0) {
    completeness.push({
      label: 'Electricity estimates incomplete',
      detail: 'Power data is missing for some components, so electricity cost estimates may be lower than actual consumption.',
    });
  }

  const expansion: ReportExpansionItem[] = [];
  for (const f of analysis.allFindings) {
    if (f.category === 'scalability') {
      expansion.push({
        label: f.title,
        detail: f.explanation,
        isPositive: f.severity === 'good',
      });
    }
  }

  const projectNotes = components.some((c) => c.notes)
    ? components.filter((c) => c.notes).map((c) => `${c.name}: ${c.notes}`).join('\n\n')
    : null;

  const goalLabels: Record<string, string> = {
    'self-hosting': 'Self-hosting',
    'storage-nas': 'Storage / NAS',
    'virtualization': 'Virtualization',
    'networking': 'Networking',
    'media-server': 'Media server',
    'cybersecurity-lab': 'Cybersecurity lab',
    'development': 'Development',
    'learning': 'Learning',
    'other': 'Other',
  };

  return {
    projectName: project.name,
    projectDescription: '',
    goal: goalLabels[project.goal] ?? project.goal,
    experienceLevel: project.experienceLevel,
    status: project.status,
    currency,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    components,
    connections,
    summary,
    hardware,
    cost,
    power,
    storage,
    network,
    health,
    findings,
    recommendations,
    completeness,
    expansion,
    projectNotes,
    isEmpty: components.length === 0,
  };
}

function formatCostValue(amount: number, currency: Currency): string {
  if (amount === 0) return '—';
  const symbols: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] ?? '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatStorageValue(tb: number): string {
  if (tb === 0) return '—';
  if (tb >= 1) return `${tb % 1 === 0 ? tb.toFixed(0) : tb.toFixed(1)}TB`;
  const gb = Math.round(tb * 1024);
  return `${gb}GB`;
}

function formatNetworkValue(gbps: number): string {
  if (gbps === 0) return '—';
  if (gbps >= 1) return `${gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)}GbE`;
  return `${Math.round(gbps * 1000)}MbE`;
}
