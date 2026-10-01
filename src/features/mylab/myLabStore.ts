import type { Project } from '@/types';
import { createProject, normalizeProject } from '@/utils/projectStore';
import type { ProjectStorage } from '@/hooks/useProjectState';

/**
 * My Lab = the user's real, currently owned homelab (the current-state
 * baseline). It reuses the Project shape so every existing calculation,
 * analysis and canvas works unchanged, but lives under its OWN storage key:
 * it is never added to the project index and never touches project records.
 */
export const MY_LAB_ID = 'my-lab';
export const MY_LAB_STORAGE_KEY = 'homelab-architect:mylab';
export const MY_LAB_SCHEMA_VERSION = 1;

interface StoredMyLab {
  schemaVersion: number;
  lab: Project;
}

export function loadMyLab(): Project | null {
  try {
    const raw = localStorage.getItem(MY_LAB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredMyLab>;
    const lab = normalizeProject(parsed?.lab);
    return lab ? { ...lab, id: MY_LAB_ID } : null;
  } catch {
    return null;
  }
}

export function saveMyLab(lab: Project): void {
  try {
    const payload: StoredMyLab = {
      schemaVersion: MY_LAB_SCHEMA_VERSION,
      lab: { ...lab, id: MY_LAB_ID },
    };
    localStorage.setItem(MY_LAB_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage full or unavailable
  }
}

export function hasMyLab(): boolean {
  const lab = loadMyLab();
  return !!lab && lab.components.length > 0;
}

export function createEmptyMyLab(currency = 'USD'): Project {
  return createProject(
    { name: 'My Lab', goal: 'other', experienceLevel: 'intermediate', currency },
    MY_LAB_ID,
  );
}

/** Storage adapter handed to the existing builder so edits persist to My Lab only. */
export const myLabStorage: ProjectStorage = {
  load: () => loadMyLab(),
  save: saveMyLab,
};
