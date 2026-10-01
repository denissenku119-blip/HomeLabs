import type { Project } from '@/types';
import type { ProjectMetrics } from '@/features/calculations/types';
import type { ArchitectureAnalysis, Finding } from '@/features/analysis/types';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { analyzeArchitecture } from '@/features/analysis/analysisEngine';
import { detectComponentRoles } from '@/features/analysis/roleDetection';
import { formatCost, formatPower, formatStorage } from '@/utils/calculations';

/**
 * Lab Health + What to Check for My Lab.
 * Pure derivation from the saved My Lab: it reuses the existing calculation
 * engine (metrics) and the existing architecture analysis (findings/score),
 * maps them into six health areas, and adds a few checks computed only from
 * values the model already contains. Nothing is persisted.
 */

export type HealthArea = 'storage' | 'power' | 'network' | 'expansion' | 'backup' | 'architecture';
export type CheckLevel = 'attention' | 'check' | 'info' | 'ok';
export type AreaStatus = 'attention' | 'check' | 'ok' | 'unknown';

export const HEALTH_AREAS: HealthArea[] = ['storage', 'power', 'network', 'expansion', 'backup', 'architecture'];

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface LabCheck {
  id: string;
  area: HealthArea;
  level: CheckLevel;
  title: string;
  what: string;
  why?: string;
  action?: string;
  /** Components in My Lab this check refers to (used to focus the topology). */
  componentIds: string[];
}

export interface LabHealth {
  metrics: ProjectMetrics;
  analysis: ArchitectureAnalysis;
  checks: LabCheck[];
  areaStatus: Record<HealthArea, AreaStatus>;
  counts: { attention: number; check: number; info: number };
}

const LEVEL_ORDER: Record<CheckLevel, number> = { attention: 0, check: 1, info: 2, ok: 3 };
const ATTENTION_RULES = new Set(['no-backup-destination', 'switch-near-full']);

function areaForFinding(f: Finding): HealthArea | null {
  switch (f.ruleId) {
    case 'missing-power': return 'power';
    case 'missing-network': return 'network';
    case 'missing-price': return 'power';
    case 'storage-detected': return 'storage';
  }
  switch (f.category) {
    case 'storage': return 'storage';
    case 'power': return 'power';
    case 'network': return 'network';
    case 'scalability': return 'expansion';
    case 'backup': return 'backup';
    case 'reliability':
    case 'compute':
    case 'data-completeness': return 'architecture';
    case 'budget': return null; // My Lab has no budget — budget rules do not apply.
  }
  return null;
}

function levelForFinding(f: Finding): CheckLevel {
  if (f.severity === 'critical') return 'attention';
  if (f.severity === 'warning') return ATTENTION_RULES.has(f.ruleId) ? 'attention' : 'check';
  if (f.severity === 'info') return 'info';
  return 'ok';
}

function targetsForFinding(f: Finding, lab: Project): string[] {
  if (f.id === f.ruleId) return [];
  const suffix = f.id.slice(f.ruleId.length + 1);
  if (lab.components.some((c) => c.instanceId === suffix)) return [suffix];
  const conn = lab.connections.find((c) => c.id === suffix);
  return conn ? [conn.fromId, conn.toId] : [];
}

export function computeLabHealth(lab: Project, t: Translate): LabHealth {
  const metrics = calculateProjectMetrics(lab, { electricityCostPerKwh: lab.electricityCostPerKwh });
  const analysis = analyzeArchitecture(lab, metrics);
  const { roles } = detectComponentRoles(lab.components);
  const checks: LabCheck[] = [];

  // 1) Existing architecture findings, re-grouped into health areas.
  for (const f of analysis.allFindings) {
    const area = areaForFinding(f);
    if (!area) continue;
    checks.push({
      id: f.id,
      area,
      level: levelForFinding(f),
      title: f.title,
      what: f.detail?.detected ?? f.explanation,
      why: f.detail?.whyItMatters,
      action: f.detail?.whatYouCanDo ?? f.recommendation,
      componentIds: targetsForFinding(f, lab),
    });
  }

  // 2) Additional checks derived only from modeled values.
  const cur = lab.currency;
  const connectedIds = new Set<string>();
  for (const c of lab.connections) {
    connectedIds.add(c.fromId);
    connectedIds.add(c.toId);
  }

  // Storage distribution
  const withStorage = lab.components.filter((c) => c.storageTB > 0);
  const totalTB = metrics.storage.totalRawStorageTB;
  if (withStorage.length === 1 && totalTB > 0) {
    const only = withStorage[0];
    checks.push({
      id: 'lab-storage-single', area: 'storage', level: 'check',
      title: t('labhealth.c.storageSingle.title'),
      what: t('labhealth.c.storageSingle.what', { total: formatStorage(totalTB), name: only.name }),
      why: t('labhealth.c.storageSingle.why'),
      action: t('labhealth.c.storageSingle.action'),
      componentIds: [only.instanceId],
    });
  } else if (withStorage.length > 1 && totalTB > 0) {
    const top = [...withStorage].sort((a, b) => b.storageTB - a.storageTB)[0];
    const share = Math.round((top.storageTB / totalTB) * 100);
    if (share >= 70) {
      checks.push({
        id: 'lab-storage-concentrated', area: 'storage', level: 'check',
        title: t('labhealth.c.storageConc.title'),
        what: t('labhealth.c.storageConc.what', { name: top.name, share, total: formatStorage(totalTB), count: withStorage.length }),
        why: t('labhealth.c.storageConc.why'),
        action: t('labhealth.c.storageConc.action'),
        componentIds: [top.instanceId],
      });
    } else {
      checks.push({
        id: 'lab-storage-spread', area: 'storage', level: 'info',
        title: t('labhealth.c.storageSpread.title'),
        what: t('labhealth.c.storageSpread.what', { total: formatStorage(totalTB), count: withStorage.length }),
        componentIds: withStorage.map((c) => c.instanceId),
      });
    }
  }

  // Power contributors + electricity rate
  const powered = lab.components.filter((c) => c.powerWatts > 0);
  const totalW = metrics.power.totalKnownPowerWatts;
  if (powered.length >= 2 && totalW > 0) {
    const top = [...powered].sort((a, b) => b.powerWatts - a.powerWatts)[0];
    const share = Math.round((top.powerWatts / totalW) * 100);
    if (share >= 40) {
      checks.push({
        id: 'lab-power-top', area: 'power', level: 'info',
        title: t('labhealth.c.powerTop.title'),
        what: t('labhealth.c.powerTop.what', { name: top.name, watts: formatPower(top.powerWatts), share, total: formatPower(totalW) }),
        why: t('labhealth.c.powerTop.why'),
        action: t('labhealth.c.powerTop.action'),
        componentIds: [top.instanceId],
      });
    }
  }
  if (metrics.energy.hasPowerData) {
    checks.push({
      id: 'lab-energy-rate', area: 'power', level: 'info',
      title: t('labhealth.c.energy.title'),
      what: t('labhealth.c.energy.what', {
        monthly: formatCost(metrics.energy.monthlyCost, cur),
        annual: formatCost(metrics.energy.annualCost, cur),
        kwh: metrics.energy.monthlyKwh.toFixed(1),
        rate: String(metrics.energy.electricityCostPerKwh),
      }),
      why: t('labhealth.c.energy.why'),
      componentIds: [],
    });
  }

  // Backup device present but not connected to anything
  const backupIds = lab.components.filter((c) => roles.get(c.instanceId) === 'backup').map((c) => c.instanceId);
  const unlinkedBackup = lab.components.filter((c) => backupIds.includes(c.instanceId) && !connectedIds.has(c.instanceId));
  for (const b of unlinkedBackup) {
    checks.push({
      id: `lab-backup-unlinked-${b.instanceId}`, area: 'backup', level: 'check',
      title: t('labhealth.c.backupUnlinked.title', { name: b.name }),
      what: t('labhealth.c.backupUnlinked.what', { name: b.name }),
      why: t('labhealth.c.backupUnlinked.why'),
      action: t('labhealth.c.backupUnlinked.action'),
      componentIds: [b.instanceId],
    });
  }
  if (backupIds.length > 0) {
    checks.push({
      id: 'lab-backup-model-only', area: 'backup', level: 'info',
      title: t('labhealth.c.backupModel.title'),
      what: t('labhealth.c.backupModel.what'),
      componentIds: backupIds,
    });
  }

  // Isolated devices not already covered by existing compute/router rules
  const isolated = lab.components.filter((c) => {
    if (connectedIds.has(c.instanceId)) return false;
    const role = roles.get(c.instanceId);
    if (role === 'compute' || role === 'router' || role === 'backup') return false;
    return c.formFactor !== 'drive' && c.formFactor !== 'cabinet' && c.formFactor !== 'panel' && c.formFactor !== 'card';
  });
  for (const c of isolated) {
    checks.push({
      id: `lab-isolated-${c.instanceId}`, area: 'architecture', level: 'check',
      title: t('labhealth.c.isolated.title', { name: c.name }),
      what: t('labhealth.c.isolated.what', { name: c.name }),
      why: t('labhealth.c.isolated.why'),
      action: t('labhealth.c.isolated.action'),
      componentIds: [c.instanceId],
    });
  }

  checks.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  const areaStatus = {} as Record<HealthArea, AreaStatus>;
  for (const area of HEALTH_AREAS) {
    const list = checks.filter((c) => c.area === area);
    areaStatus[area] = list.some((c) => c.level === 'attention')
      ? 'attention'
      : list.some((c) => c.level === 'check')
        ? 'check'
        : list.length > 0
          ? 'ok'
          : 'unknown';
  }

  return {
    metrics,
    analysis,
    checks,
    areaStatus,
    counts: {
      attention: checks.filter((c) => c.level === 'attention').length,
      check: checks.filter((c) => c.level === 'check').length,
      info: checks.filter((c) => c.level === 'info').length,
    },
  };
}

export function healthSummaryKey(h: LabHealth): string {
  if (h.counts.attention > 0) return 'labhealth.summary.attention';
  if (h.counts.check > 0) return 'labhealth.summary.check';
  return 'labhealth.summary.ok';
}
