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

export type SpecSourceType = 'estimate' | 'typical' | 'manufacturer' | 'user';

export type FormFactor =
  | 'mini-pc'
  | 'nuc'
  | 'sff'
  | 'desktop'
  | 'tower'
  | 'rack-1u'
  | 'rack-2u'
  | 'rack-4u'
  | 'sbc'
  | 'nas-desktop'
  | 'rackmount-nas'
  | 'ap'
  | 'desktop-router'
  | 'rack-router'
  | 'ups-tower'
  | 'ups-rack'
  | 'pdu'
  | 'drive'
  | 'external'
  | 'card'
  | 'adapter'
  | 'panel'
  | 'cabinet'
  | 'wall-mount'
  | 'custom';

export interface HardwareDefinition {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: ComponentCategory;
  subcategory?: string;
  description: string;
  typicalPrice: number;
  currency: Currency;
  powerWatts: number;
  idlePowerWatts?: number;
  maxPowerWatts?: number;
  storageTB: number;
  driveBays?: number;
  networkPorts?: number;
  networkSpeedGbps: number;
  cpuCores?: number;
  ramGB?: number;
  expandableRam?: boolean;
  formFactor: FormFactor;
  virtualizationSupport?: boolean;
  useCases: string[];
  notes?: string;
  specSourceType: SpecSourceType;
}

export interface ProjectComponent {
  instanceId: string;
  hardwareDefinitionId: string;
  x: number;
  y: number;

  name: string;
  manufacturer: string;
  model: string;
  category: ComponentCategory;
  subcategory?: string;
  description: string;

  price: number;
  currency: Currency;
  powerWatts: number;
  idlePowerWatts?: number;
  maxPowerWatts?: number;
  storageTB: number;
  driveBays?: number;
  networkPorts?: number;
  networkSpeedGbps: number;
  cpuCores?: number;
  ramGB?: number;
  expandableRam?: boolean;
  formFactor: FormFactor;
  virtualizationSupport?: boolean;
  useCases: string[];
  notes?: string;
  specSourceType: SpecSourceType;

  hasOverrides?: boolean;
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
  electricityCostPerKwh: number;
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

export interface CompatibilityHint {
  id: string;
  severity: 'info' | 'warning';
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

export interface CustomHardwareInput {
  name: string;
  manufacturer: string;
  model: string;
  category: ComponentCategory;
  price: number;
  powerWatts: number;
  storageTB: number;
  networkSpeedGbps: number;
  notes?: string;
}
