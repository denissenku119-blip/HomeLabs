import type {
  ComponentDefinition,
  ProjectComponent,
  Connection,
  Project,
  ConnectionType,
  CreateProjectInput,
  ProjectComponent as PC,
} from '@/types';
import { STORAGE_KEY_PREFIX } from '@/data/constants';

let instanceCounter = 0;

export function generateInstanceId(): string {
  instanceCounter += 1;
  return `inst-${Date.now()}-${instanceCounter}`;
}

export function createProjectComponent(
  def: ComponentDefinition,
  x: number = 0,
  y: number = 0
): ProjectComponent {
  return {
    ...def,
    instanceId: generateInstanceId(),
    x,
    y,
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
    // Storage may be full or unavailable — fail silently
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

function normalizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.id || !obj.name) return null;

  const components = Array.isArray(obj.components)
    ? (obj.components as unknown[]).filter(isValidComponent) as PC[]
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
  return !!obj.instanceId && !!obj.id && typeof obj.x === 'number' && typeof obj.y === 'number';
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
