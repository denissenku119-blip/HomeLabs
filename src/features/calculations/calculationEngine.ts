import type { Project } from '@/types';
import type { ProjectMetrics, BudgetResult } from './types';
import { calculateCost } from './costCalculations';
import { calculatePower, calculateEnergy } from './powerCalculations';
import { calculateStorage } from './storageCalculations';
import { calculateNetwork } from './networkCalculations';

export interface CalculationOptions {
  electricityCostPerKwh?: number;
}

const DEFAULT_ELECTRICITY_COST = 0.15;

export function calculateProjectMetrics(
  project: Project,
  options?: CalculationOptions
): ProjectMetrics {
  const { components, connections, currency, budget } = project;
  const electricityCost = options?.electricityCostPerKwh ?? DEFAULT_ELECTRICITY_COST;

  const cost = calculateCost(components, currency);
  const power = calculatePower(components);
  const energy = calculateEnergy(power, electricityCost, currency);
  const storage = calculateStorage(components);
  const network = calculateNetwork(components, connections);

  const budgetResult: BudgetResult = {
    budget: budget ?? null,
    knownCost: cost.totalKnownCost,
    remaining: budget != null ? budget - cost.totalKnownCost : null,
    isOverBudget: budget != null && cost.totalKnownCost > budget,
    overAmount: budget != null && cost.totalKnownCost > budget
      ? cost.totalKnownCost - budget
      : null,
    unpricedCount: cost.unpricedComponentCount,
    hasUnpricedItems: cost.unpricedComponentCount > 0,
  };

  const firstYearCost = energy.hasPowerData
    ? cost.totalKnownCost + energy.annualCost
    : cost.totalKnownCost > 0
      ? cost.totalKnownCost
      : null;

  const unknownDataCount =
    cost.unpricedComponentCount +
    power.unknownPowerCount +
    storage.unknownStorageCount +
    network.unknownLinks;

  return {
    componentCount: components.length,
    cost,
    power,
    energy,
    storage,
    network,
    budget: budgetResult,
    firstYearCost,
    hasUnknownData: unknownDataCount > 0,
    unknownDataCount,
  };
}

export type { ProjectMetrics } from './types';
