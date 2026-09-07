export type ProjectStatus = 'draft' | 'in-progress' | 'complete' | 'archived';

export type ComponentCategory =
  | 'compute'
  | 'storage'
  | 'networking'
  | 'power'
  | 'virtualization'
  | 'security'
  | 'other';

export type ConnectionType =
  | 'ethernet'
  | 'wifi'
  | 'storage'
  | 'power'
  | 'other';

export type Currency = 'USD' | 'EUR' | 'GBP';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type PrimaryGoal =
  | 'self-hosting'
  | 'storage-nas'
  | 'virtualization'
  | 'networking'
  | 'media-server'
  | 'cybersecurity-lab'
  | 'development'
  | 'learning'
  | 'other';

export interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  manufacturer: string;
  model: string;
  description: string;
  price: number;
  currency: Currency;
  powerWatts: number;
  storageTB: number;
  networkSpeedGbps: number;
  notes?: string;
}

export interface ProjectComponent extends ComponentDefinition {
  instanceId: string;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
}

export interface Project {
  id: string;
  name: string;
  goal: PrimaryGoal;
  experienceLevel: ExperienceLevel;
  budget?: number;
  currency: Currency;
  status: ProjectStatus;
  components: ProjectComponent[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  totalCost: number;
  totalPowerWatts: number;
  totalStorageTB: number;
  maxNetworkSpeedGbps: number;
  componentCount: number;
}

export interface AnalysisWarning {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
}

export interface ProjectSettings {
  currency: Currency;
  budget?: number;
  voltage: number;
  includePowerCost: boolean;
}

export interface CreateProjectInput {
  name: string;
  goal: PrimaryGoal;
  experienceLevel: ExperienceLevel;
  budget?: number;
  currency: Currency;
}
