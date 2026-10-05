import type { Project } from '@/types';
import {
  loadAllProjects,
  normalizeProject,
  getStorageKey,
  getProjectIds,
  clearProjectDeletion,
} from '@/utils/projectStore';
import { STORAGE_KEY_PREFIX } from '@/data/constants';
import { MY_LAB_ID, MY_LAB_STORAGE_KEY, MY_LAB_SCHEMA_VERSION, loadMyLab } from '@/features/mylab/myLabStore';
import { HISTORY_STORAGE_KEY } from '@/features/mylab/proposalStore';

/**
 * User-controlled backup file. Everything stays on the device / wherever the
 * user saves the file — nothing is uploaded. Custom hardware lives inside the
 * project / My Lab components, so it travels with them.
 *
 * Deliberately NOT included: the Pro entitlement (only Google Play may grant
 * Pro), feedback drafts, referral data.
 */
export const BACKUP_FORMAT = 'homelab-architect-backup';
export const BACKUP_FORMAT_VERSION = 1;
const SETTINGS_KEY = 'homelab-architect:settings';

export interface BackupFileV1 {
  format: typeof BACKUP_FORMAT;
  formatVersion: 1;
  createdAt: string;
  projects: Project[];
  myLab: Project | null;
  myLabSchemaVersion: number;
  myLabHistory: unknown[];
  settings: Record<string, unknown> | null;
}

export interface BackupSummary {
  projects: number;
  myLabDevices: number | null;
  createdAt: string;
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function createBackup(): BackupFileV1 {
  const history = readJson(HISTORY_STORAGE_KEY);
  const settings = readJson(SETTINGS_KEY);
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    projects: loadAllProjects(),
    myLab: loadMyLab(),
    myLabSchemaVersion: MY_LAB_SCHEMA_VERSION,
    myLabHistory: Array.isArray(history) ? history : [],
    settings: settings && typeof settings === 'object' ? (settings as Record<string, unknown>) : null,
  };
}

export function backupFileName(): string {
  return `homelab-architect-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export type ParseResult = { ok: true; backup: BackupFileV1; summary: BackupSummary } | { ok: false; error: string };

/** Validates + migrates a backup file. Never touches storage. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid' };
  const obj = raw as Record<string, unknown>;
  if (obj.format !== BACKUP_FORMAT) return { ok: false, error: 'invalid' };
  const version = Number(obj.formatVersion);
  if (!Number.isInteger(version) || version < 1) return { ok: false, error: 'invalid' };
  if (version > BACKUP_FORMAT_VERSION) return { ok: false, error: 'newer' };
  // Future versions: add migrations here (v1 -> v2 ...) before validation.
  if (!Array.isArray(obj.projects)) return { ok: false, error: 'invalid' };

  const seen = new Set<string>();
  const projects: Project[] = [];
  for (const p of obj.projects) {
    const normalized = normalizeProject(p);
    if (!normalized) return { ok: false, error: 'invalid' };
    if (normalized.id === MY_LAB_ID || seen.has(normalized.id)) continue; // no duplicates
    seen.add(normalized.id);
    projects.push(normalized);
  }
  let myLab: Project | null = null;
  if (obj.myLab != null) {
    myLab = normalizeProject(obj.myLab);
    if (!myLab) return { ok: false, error: 'invalid' };
    myLab = { ...myLab, id: MY_LAB_ID };
  }
  const backup: BackupFileV1 = {
    format: BACKUP_FORMAT,
    formatVersion: 1,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : '',
    projects,
    myLab,
    myLabSchemaVersion: MY_LAB_SCHEMA_VERSION,
    myLabHistory: Array.isArray(obj.myLabHistory) ? obj.myLabHistory : [],
    settings: obj.settings && typeof obj.settings === 'object' ? (obj.settings as Record<string, unknown>) : null,
  };
  return {
    ok: true,
    backup,
    summary: { projects: projects.length, myLabDevices: myLab ? myLab.components.length : null, createdAt: backup.createdAt },
  };
}

/**
 * Replaces Projects, My Lab, My Lab history and settings with the backup.
 * All-or-nothing: on any write failure every touched key is rolled back to
 * its previous value, so current data is never partially overwritten.
 */
export function restoreBackup(backup: BackupFileV1): boolean {
  const writes = new Map<string, string | null>();
  const currentIds = getProjectIds();
  for (const id of currentIds) writes.set(getStorageKey(id), null);
  for (const p of backup.projects) writes.set(getStorageKey(p.id), JSON.stringify(p));
  writes.set(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(backup.projects.map((p) => p.id)));
  writes.set(
    MY_LAB_STORAGE_KEY,
    backup.myLab ? JSON.stringify({ schemaVersion: MY_LAB_SCHEMA_VERSION, lab: backup.myLab }) : null,
  );
  writes.set(HISTORY_STORAGE_KEY, JSON.stringify(backup.myLabHistory));
  if (backup.settings) writes.set(SETTINGS_KEY, JSON.stringify(backup.settings));

  const previous = new Map<string, string | null>();
  for (const key of writes.keys()) previous.set(key, localStorage.getItem(key));
  try {
    for (const [key, value] of writes) {
      if (value === null) localStorage.removeItem(key);
      else {
        localStorage.setItem(key, value);
        if (localStorage.getItem(key) !== value) throw new Error('verify');
      }
    }
    // Projects the user explicitly restored may come back; others stay deleted.
    clearProjectDeletion(backup.projects.map((p) => p.id));
    return true;
  } catch {
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // best effort
      }
    }
    return false;
  }
}
