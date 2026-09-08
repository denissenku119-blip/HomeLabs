import type {
  HardwareDefinition,
  ProjectComponent,
  Connection,
  Project,
  ConnectionType,
  CreateProjectInput,
  CustomHardwareInput,
} from '@/types';
import { STORAGE_KEY_PREFIX } from '@/data/constants';

let instanceCounter = 0;

export function generateInstanceId(): string {
  instanceCounter += 1;
  return `inst-${Date.now()}-${instanceCounter}`;
}

export function createProjectComponentFromHardware(
  hw: HardwareDefinition,
  x: number = 0,
  y: number = 0
): ProjectComponent {
  return {
    instanceId: generateInstanceId(),
    hardwareDefinitionId: hw.id,
    x,
    y,
    name: hw.name,
    manufacturer: hw.manufacturer,
    model: hw.model,
    category: hw.category,
    subcategory: hw.subcategory,
    description: hw.description,
    price: hw.typicalPrice,
    currency: hw.currency,
    powerWatts: hw.powerWatts,
    idlePowerWatts: hw.idlePowerWatts,
    maxPowerWatts: hw.maxPowerWatts,
    storageTB: hw.storageTB,
    driveBays: hw.driveBays,
    networkPorts: hw.networkPorts,
    networkSpeedGbps: hw.networkSpeedGbps,
    cpuCores: hw.cpuCores,
    ramGB: hw.ramGB,
    expandableRam: hw.expandableRam,
    formFactor: hw.formFactor,
    virtualizationSupport: hw.virtualizationSupport,
    useCases: hw.useCases,
    notes: hw.notes,
    specSourceType: hw.specSourceType,
    hasOverrides: false,
  };
}

export function createCustomHardwareComponent(
  input: CustomHardwareInput,
  x: number = 0,
  y: number = 0
): ProjectComponent {
  const id = `custom-${Date.now()}`;
  return {
    instanceId: generateInstanceId(),
    hardwareDefinitionId: id,
    x,
    y,
    name: input.name,
    manufacturer: input.manufacturer,
    model: input.model,
    category: input.category,
    description: `${input.manufacturer} ${input.model} — custom hardware`,
    price: input.price,
    currency: 'USD',
    powerWatts: input.powerWatts,
    storageTB: input.storageTB,
    networkSpeedGbps: input.networkSpeedGbps,
    formFactor: 'custom',
    useCases: [],
    notes: input.notes,
    specSourceType: 'user',
    hasOverrides: false,
  };
}

export function createConnection(
  fromId: string,
  toId: string,
  type: ConnectionType = 'ethernet',
  label?: string
): Connection {
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fromId,
    toId,
    type,
    label,
  };
}

export function createProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString();
  return {
    id: `proj-${Date.now()}`,
    name: input.name,
    goal: input.goal,
    experienceLevel: input.experienceLevel,
    budget: input.budget,
    currency: input.currency,
    electricityCostPerKwh: 0.15,
    status: 'draft',
    components: [],
    connections: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getStorageKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`;
}

export function saveProject(project: Project): void {
  try {
    const key = getStorageKey(project.id);
    localStorage.setItem(key, JSON.stringify(project));
    saveProjectId(project.id);
  } catch {
    // Storage may be full or unavailable
  }
}

export function loadProject(projectId: string): Project | null {
  try {
    const key = getStorageKey(projectId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return normalizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function deleteProject(projectId: string): void {
  try {
    localStorage.removeItem(getStorageKey(projectId));
    const ids = getProjectIds().filter((id) => id !== projectId);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(ids));
  } catch {
    // fail silently
  }
}

function saveProjectId(id: string): void {
  const ids = getProjectIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(ids));
    } catch {
      // fail silently
    }
  }
}

export function getProjectIds(): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}index`);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function loadAllProjects(): Project[] {
  return getProjectIds()
    .map((id) => loadProject(id))
    .filter((p): p is Project => p !== null);
}

const COMPONENT_DEFAULTS = {
  manufacturer: 'Generic',
  formFactor: 'custom' as const,
  useCases: [] as string[],
  specSourceType: 'user' as const,
  hasOverrides: false,
};

function normalizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.id || !obj.name) return null;

  const components = Array.isArray(obj.components)
    ? (obj.components as unknown[]).filter(isValidComponent).map(normalizeComponent)
    : [];

  const validInstanceIds = new Set(components.map((c) => c.instanceId));
  const connections = Array.isArray(obj.connections)
    ? (obj.connections as unknown[])
        .filter((c) => isValidConnection(c, validInstanceIds)) as Connection[]
    : [];

  return {
    id: String(obj.id),
    name: String(obj.name),
    goal: (obj.goal as Project['goal']) ?? 'other',
    experienceLevel: (obj.experienceLevel as Project['experienceLevel']) ?? 'beginner',
    budget: typeof obj.budget === 'number' ? obj.budget : undefined,
    currency: (obj.currency as Project['currency']) ?? 'USD',
    electricityCostPerKwh: typeof obj.electricityCostPerKwh === 'number' ? obj.electricityCostPerKwh : 0.15,
    status: (obj.status as Project['status']) ?? 'draft',
    components,
    connections,
    createdAt: String(obj.createdAt ?? new Date().toISOString()),
    updatedAt: String(obj.updatedAt ?? new Date().toISOString()),
  };
}

function isValidComponent(c: unknown): boolean {
  if (!c || typeof c !== 'object') return false;
  const obj = c as Record<string, unknown>;
  return !!obj.instanceId && typeof obj.x === 'number' && typeof obj.y === 'number';
}

function normalizeComponent(c: unknown): ProjectComponent {
  const obj = c as Record<string, unknown>;
  return {
    instanceId: String(obj.instanceId),
    hardwareDefinitionId: String(obj.hardwareDefinitionId ?? obj.id ?? 'legacy'),
    x: Number(obj.x) || 0,
    y: Number(obj.y) || 0,
    name: String(obj.name ?? 'Unknown'),
    manufacturer: String(obj.manufacturer ?? COMPONENT_DEFAULTS.manufacturer),
    model: String(obj.model ?? ''),
    category: (obj.category as ProjectComponent['category']) ?? 'other',
    subcategory: obj.subcategory ? String(obj.subcategory) : undefined,
    description: String(obj.description ?? ''),
    price: Number(obj.price) || 0,
    currency: (obj.currency as ProjectComponent['currency']) ?? 'USD',
    powerWatts: Number(obj.powerWatts) || 0,
    idlePowerWatts: obj.idlePowerWatts != null ? Number(obj.idlePowerWatts) : undefined,
    maxPowerWatts: obj.maxPowerWatts != null ? Number(obj.maxPowerWatts) : undefined,
    storageTB: Number(obj.storageTB) || 0,
    driveBays: obj.driveBays != null ? Number(obj.driveBays) : undefined,
    networkPorts: obj.networkPorts != null ? Number(obj.networkPorts) : undefined,
    networkSpeedGbps: Number(obj.networkSpeedGbps) || 0,
    cpuCores: obj.cpuCores != null ? Number(obj.cpuCores) : undefined,
    ramGB: obj.ramGB != null ? Number(obj.ramGB) : undefined,
    expandableRam: obj.expandableRam != null ? Boolean(obj.expandableRam) : undefined,
    formFactor: (obj.formFactor as ProjectComponent['formFactor']) ?? COMPONENT_DEFAULTS.formFactor,
    virtualizationSupport: obj.virtualizationSupport != null ? Boolean(obj.virtualizationSupport) : undefined,
    useCases: Array.isArray(obj.useCases) ? (obj.useCases as string[]) : COMPONENT_DEFAULTS.useCases,
    notes: obj.notes ? String(obj.notes) : undefined,
    specSourceType: (obj.specSourceType as ProjectComponent['specSourceType']) ?? COMPONENT_DEFAULTS.specSourceType,
    hasOverrides: obj.hasOverrides != null ? Boolean(obj.hasOverrides) : COMPONENT_DEFAULTS.hasOverrides,
  };
}

function isValidConnection(c: unknown, validIds: Set<string>): boolean {
  if (!c || typeof c !== 'object') return false;
  const obj = c as Record<string, unknown>;
  return (
    !!obj.id &&
    !!obj.fromId &&
    !!obj.toId &&
    validIds.has(String(obj.fromId)) &&
    validIds.has(String(obj.toId))
  );
}

export function getSmartPlacement(
  existingCount: number,
  canvasCenterX: number = 250,
  canvasCenterY: number = 180
): { x: number; y: number } {
  if (existingCount === 0) {
    return { x: canvasCenterX, y: canvasCenterY };
  }
  const angle = (existingCount * 0.8) % (Math.PI * 2);
  const radius = 80 + Math.floor(existingCount / 6) * 60;
  return {
    x: canvasCenterX + Math.cos(angle) * radius - 70,
    y: canvasCenterY + Math.sin(angle) * radius - 35,
  };
}
