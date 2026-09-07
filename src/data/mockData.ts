import type { Project } from '@/types';
import { componentCatalog } from '@/data/componentCatalog';
import { createProjectComponent } from '@/utils/projectStore';

function buildDemoProject(
  id: string,
  name: string,
  goal: Project['goal'],
  level: Project['experienceLevel'],
  budget: number,
  componentCount: number
): Project {
  const now = new Date().toISOString();
  const components = componentCatalog.slice(0, componentCount).map((def, i) =>
    createProjectComponent(def, 120 + (i % 3) * 170, 100 + Math.floor(i / 3) * 130)
  );
  return {
    id,
    name,
    goal,
    experienceLevel: level,
    budget,
    currency: 'USD',
    status: 'draft',
    components,
    connections: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const mockProjects: Project[] = [
  buildDemoProject('demo-1', 'My First HomeLab', 'learning', 'beginner', 1500, 5),
  buildDemoProject('demo-2', 'Proxmox Lab', 'virtualization', 'advanced', 2500, 8),
];

export const exploreExamples = [
  {
    id: 'exp-1',
    name: 'Starter Self-Hosted Lab',
    difficulty: 'beginner' as const,
    componentCount: 5,
    purpose: 'Self-host essential services like DNS, ad-blocking, and file sharing on a single low-power device.',
    estimatedBudget: 450,
  },
  {
    id: 'exp-2',
    name: 'Home NAS + Backup',
    difficulty: 'beginner' as const,
    componentCount: 6,
    purpose: 'Centralized storage with automated backups and redundant drives for family photos and documents.',
    estimatedBudget: 800,
  },
  {
    id: 'exp-3',
    name: 'Proxmox Learning Lab',
    difficulty: 'advanced' as const,
    componentCount: 11,
    purpose: 'Virtualization playground with Proxmox, multiple VMs, and isolated networks for experimentation.',
    estimatedBudget: 2100,
  },
  {
    id: 'exp-4',
    name: 'Media Server Lab',
    difficulty: 'intermediate' as const,
    componentCount: 8,
    purpose: 'Stream movies, music, and photos across your home with hardware transcoding and remote access.',
    estimatedBudget: 1200,
  },
  {
    id: 'exp-5',
    name: 'Cybersecurity Practice Lab',
    difficulty: 'intermediate' as const,
    componentCount: 7,
    purpose: 'Isolated environment for penetration testing, SIEM practice, and security tool exploration.',
    estimatedBudget: 950,
  },
];
