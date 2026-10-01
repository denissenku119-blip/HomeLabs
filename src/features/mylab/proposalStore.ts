import type { Project, ProjectComponent } from '@/types';
import type { ProjectStorage } from '@/hooks/useProjectState';
import { normalizeProject } from '@/utils/projectStore';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { loadMyLab, saveMyLab } from '@/features/mylab/myLabStore';

/**
 * Plan Change: a temporary Proposed Lab derived from (a deep copy of) My Lab.
 * Edits only ever touch the proposal key. My Lab is replaced exclusively by
 * applyProposal(), which is also the only thing that writes Lab History.
 */
export const PROPOSAL_ID = 'my-lab-proposal';
export const PROPOSAL_STORAGE_KEY = 'homelab-architect:mylab:proposal';
export const HISTORY_STORAGE_KEY = 'homelab-architect:mylab:history';

export type ChangeType = 'add' | 'remove' | 'replace' | 'upgrade' | 'connection' | 'storage' | 'network';
export const CHANGE_TYPES: ChangeType[] = ['add', 'remove', 'replace', 'upgrade', 'connection', 'storage', 'network'];

interface StoredProposal {
  schemaVersion: 1;
  changeType: ChangeType;
  createdAt: string;
  lab: Project;
}

export interface LabSummary {
  devices: number;
  connections: number;
  storageTB: number;
  powerW: number;
  monthlyCost: number;
  monthlyKwh: number;
  hardwareCost: number;
  fastestGbps: number;
  slowestGbps: number;
}

export interface HistoryEntry {
  id: string;
  appliedAt: string;
  changeType: ChangeType;
  description: string;
  affected: string[];
  currency: string;
  before: LabSummary;
  after: LabSummary;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function loadProposal(): { changeType: ChangeType; createdAt: string; lab: Project } | null {
  try {
    const raw = localStorage.getItem(PROPOSAL_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredProposal>;
    const lab = normalizeProject(p?.lab);
    if (!lab || !p.changeType || !CHANGE_TYPES.includes(p.changeType)) return null;
    return { changeType: p.changeType, createdAt: p.createdAt ?? new Date().toISOString(), lab: { ...lab, id: PROPOSAL_ID } };
  } catch {
    return null;
  }
}

function writeProposal(changeType: ChangeType, createdAt: string, lab: Project) {
  try {
    const payload: StoredProposal = { schemaVersion: 1, changeType, createdAt, lab: { ...lab, id: PROPOSAL_ID } };
    localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable
  }
}

/** Start a proposal from a deep copy of My Lab (never a shared reference). */
export function startProposal(changeType: ChangeType): Project | null {
  const lab = loadMyLab();
  if (!lab) return null;
  const copy = { ...clone(lab), id: PROPOSAL_ID };
  writeProposal(changeType, new Date().toISOString(), copy);
  return copy;
}

export function discardProposal() {
  try { localStorage.removeItem(PROPOSAL_STORAGE_KEY); } catch { /* ignore */ }
}

export const proposalStorage: ProjectStorage = {
  load: () => loadProposal()?.lab ?? null,
  save: (lab) => {
    const cur = loadProposal();
    if (!cur) return; // proposal was discarded/applied — never resurrect it
    writeProposal(cur.changeType, cur.createdAt, lab);
  },
};

export function summarizeLab(lab: Project): LabSummary {
  const m = calculateProjectMetrics(lab, { electricityCostPerKwh: lab.electricityCostPerKwh });
  const speeds = m.network.connections.map((c) => c.effectiveSpeedGbps).filter((s): s is number => !!s && s > 0);
  return {
    devices: m.componentCount,
    connections: m.network.connectionCount,
    storageTB: m.storage.totalRawStorageTB,
    powerW: m.power.totalKnownPowerWatts,
    monthlyCost: m.energy.monthlyCost,
    monthlyKwh: m.energy.monthlyKwh,
    hardwareCost: m.cost.totalKnownCost,
    fastestGbps: m.network.fastestInterfaceGbps ?? 0,
    slowestGbps: speeds.length ? Math.min(...speeds) : 0,
  };
}

const SPEC_FIELDS: (keyof ProjectComponent)[] = [
  'hardwareDefinitionId', 'name', 'manufacturer', 'model', 'category', 'price', 'powerWatts',
  'idlePowerWatts', 'maxPowerWatts', 'storageTB', 'driveBays', 'networkPorts', 'networkSpeedGbps',
  'cpuCores', 'ramGB', 'formFactor',
];

export interface LabDiff {
  added: ProjectComponent[];
  removed: ProjectComponent[];
  changed: { before: ProjectComponent; after: ProjectComponent }[];
  connectionsAdded: number;
  connectionsRemoved: number;
  connectionsChanged: number;
}

export function diffLabs(current: Project, proposed: Project): LabDiff {
  const cur = new Map(current.components.map((c) => [c.instanceId, c]));
  const next = new Map(proposed.components.map((c) => [c.instanceId, c]));
  const added = proposed.components.filter((c) => !cur.has(c.instanceId));
  const removed = current.components.filter((c) => !next.has(c.instanceId));
  const changed = proposed.components
    .filter((c) => cur.has(c.instanceId))
    .map((after) => ({ before: cur.get(after.instanceId)!, after }))
    .filter(({ before, after }) => SPEC_FIELDS.some((f) => before[f] !== after[f]));
  const curConn = new Map(current.connections.map((c) => [c.id, c]));
  const nextConn = new Map(proposed.connections.map((c) => [c.id, c]));
  const connectionsAdded = proposed.connections.filter((c) => !curConn.has(c.id)).length;
  const connectionsRemoved = current.connections.filter((c) => !nextConn.has(c.id)).length;
  const connectionsChanged = proposed.connections.filter((c) => {
    const b = curConn.get(c.id);
    return b && (b.fromId !== c.fromId || b.toId !== c.toId || b.type !== c.type || b.label !== c.label);
  }).length;
  return { added, removed, changed, connectionsAdded, connectionsRemoved, connectionsChanged };
}

export function diffIsEmpty(d: LabDiff) {
  return !d.added.length && !d.removed.length && !d.changed.length && !d.connectionsAdded && !d.connectionsRemoved && !d.connectionsChanged;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr as HistoryEntry[]).filter((e) => e && e.id && e.before && e.after) : [];
  } catch {
    return [];
  }
}

/** The ONLY path that modifies My Lab from a proposal. Records one history entry. */
export function applyProposal(description: string, affected: string[]): boolean {
  const current = loadMyLab();
  const proposal = loadProposal();
  if (!current || !proposal) return false;
  const entry: HistoryEntry = {
    id: `h-${Date.now()}`,
    appliedAt: new Date().toISOString(),
    changeType: proposal.changeType,
    description,
    affected,
    currency: current.currency,
    before: summarizeLab(current),
    after: summarizeLab(proposal.lab),
  };
  saveMyLab({ ...clone(proposal.lab), updatedAt: new Date().toISOString() });
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([entry, ...loadHistory()]));
  } catch { /* ignore */ }
  discardProposal();
  return true;
}
