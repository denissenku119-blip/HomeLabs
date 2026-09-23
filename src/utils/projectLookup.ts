import type { Project } from '@/types';
import { loadProject } from '@/utils/projectStore';
import { mockProjects } from '@/data/mockData';

/**
 * Resolves a project id to a project, falling back to the bundled demo
 * projects so deep links (workspace, report) never dead-end.
 */
export function findProject(id: string | undefined): Project | null {
  if (!id) return null;
  try {
    const stored = loadProject(id);
    if (stored) return stored;
    return mockProjects.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}
