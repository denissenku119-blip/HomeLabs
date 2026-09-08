import type { ComponentCategory, Currency } from '@/types';

export interface CostBreakdownItem {
  category: ComponentCategory;
  amount: number;
  componentCount: number;
}

export interface CostResult {
  totalKnownCost: number;
  knownComponentCount: number;
  unpricedComponentCount: number;
  unpricedComponents: string[];
  breakdown: CostBreakdownItem[];
  currency: Currency;
}

export interface PowerResult {
  totalKnownPowerWatts: number;
  knownComponentCount: number;
  unknownPowerCount: number;
  unknownPowerComponents: string[];
  totalIdlePowerWatts: number | null;
  totalMaxPowerWatts: number | null;
  hasIdleData: boolean;
  hasMaxData: boolean;
  componentBreakdown: { name: string; powerWatts: number; isUnknown: boolean }[];
}

export interface EnergyResult {
  estimatedContinuousPowerWatts: number;
  hasPowerData: boolean;
  unknownPowerCount: number;
  monthlyKwh: number;
  annualKwh: number;
  electricityCostPerKwh: number;
  monthlyCost: number;
  annualCost: number;
  currency: Currency;
}

export interface StorageResult {
  totalRawStorageTB: number;
  hasStorageData: boolean;
  unknownStorageCount: number;
  storageDeviceCount: number;
  nasCount: number;
  knownDriveBays: number | null;
  unknownDriveBaysCount: number;
  componentBreakdown: { name: string; storageTB: number; driveBays?: number; isUnknown: boolean }[];
}

export interface NetworkConnectionInfo {
  connectionId: string;
  fromName: string;
  toName: string;
  effectiveSpeedGbps: number | null;
  isUnknown: boolean;
  connectionType: string;
}

export interface NetworkResult {
  fastestInterfaceGbps: number | null;
  networkCapableCount: number;
  unknownNetworkCount: number;
  connectionCount: number;
  knownEffectiveLinks: number;
  unknownLinks: number;
  connections: NetworkConnectionInfo[];
}

export interface BudgetResult {
  budget: number | null;
  knownCost: number;
  remaining: number | null;
  isOverBudget: boolean;
  overAmount: number | null;
  unpricedCount: number;
  hasUnpricedItems: boolean;
}

export interface ProjectMetrics {
  componentCount: number;
  cost: CostResult;
  power: PowerResult;
  energy: EnergyResult;
  storage: StorageResult;
  network: NetworkResult;
  budget: BudgetResult;
  firstYearCost: number | null;
  hasUnknownData: boolean;
  unknownDataCount: number;
}
