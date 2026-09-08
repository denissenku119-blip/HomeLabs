import type { Project } from '@/types';
import { hardwareCatalog } from '@/data/hardware';
import { createProjectComponentFromHardware } from '@/utils/projectStore';

function findHw(id: string) {
  const hw = hardwareCatalog.find((h) => h.id === id);
  if (!hw) throw new Error(`Hardware ${id} not found`);
  return hw;
}

function buildProject(
  id: string,
  name: string,
  goal: Project['goal'],
  level: Project['experienceLevel'],
  budget: number,
  hardwareIds: string[]
): Project {
  const now = new Date().toISOString();
  const components = hardwareIds.map((hwId, i) =>
    createProjectComponentFromHardware(
      findHw(hwId),
      120 + (i % 3) * 180,
      80 + Math.floor(i / 3) * 140
    )
  );
  return {
    id,
    name,
    goal,
    experienceLevel: level,
    budget,
    currency: 'USD',
    electricityCostPerKwh: 0.15,
    status: 'draft',
    components,
    connections: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const mockProjects: Project[] = [
  buildProject(
    'demo-starter',
    'Starter Self-Hosted Lab',
    'self-hosting',
    'beginner',
    450,
    ['hw-mini-pc', 'hw-basic-router', 'hw-managed-switch-1g', 'hw-small-ups']
  ),
  buildProject(
    'demo-proxmox',
    'Proxmox Learning Lab',
    'virtualization',
    'advanced',
    2500,
    ['hw-mini-pc', 'hw-mini-pc', 'hw-mini-pc', 'hw-managed-switch-25g', 'hw-prosumer-router', 'hw-medium-ups']
  ),
  buildProject(
    'demo-nas',
    'Home NAS + Backup',
    'storage-nas',
    'beginner',
    800,
    ['hw-4bay-nas', 'hw-nas-hdd-4tb', 'hw-nas-hdd-4tb', 'hw-unmanaged-switch', 'hw-usb-backup-4tb', 'hw-small-ups']
  ),
];

export const exploreExamples = [
  {
    id: 'exp-1',
    name: 'Starter Self-Hosted Lab',
    difficulty: 'beginner' as const,
    componentCount: 4,
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
    componentCount: 6,
    purpose: 'Virtualization playground with Proxmox, multiple nodes, and isolated networks for experimentation.',
    estimatedBudget: 2100,
  },
  {
    id: 'exp-4',
    name: 'Media Server Lab',
    difficulty: 'intermediate' as const,
    componentCount: 5,
    purpose: 'Stream movies, music, and photos across your home with hardware transcoding and remote access.',
    estimatedBudget: 1200,
  },
  {
    id: 'exp-5',
    name: 'Cybersecurity Practice Lab',
    difficulty: 'intermediate' as const,
    componentCount: 5,
    purpose: 'Isolated environment for penetration testing, SIEM practice, and security tool exploration.',
    estimatedBudget: 950,
  },
];
