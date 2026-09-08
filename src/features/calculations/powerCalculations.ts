import type { ProjectComponent } from '@/types';
import type { PowerResult } from './types';

function sanitizeNumber(value: number | undefined | null): number | null {
  if (value == null || isNaN(value) || value < 0) return null;
  return value;
}

export function calculatePower(components: ProjectComponent[]): PowerResult {
  let totalKnownPowerWatts = 0;
  let knownComponentCount = 0;
  let unknownPowerCount = 0;
  const unknownPowerComponents: string[] = [];

  let totalIdlePowerWatts = 0;
  let totalMaxPowerWatts = 0;
  let hasIdleData = false;
  let hasMaxData = false;

  const componentBreakdown: PowerResult['componentBreakdown'] = [];

  for (const comp of components) {
    const power = sanitizeNumber(comp.powerWatts);

    if (power != null && power > 0) {
      totalKnownPowerWatts += power;
      knownComponentCount++;
      componentBreakdown.push({ name: comp.name, powerWatts: power, isUnknown: false });
    } else {
      unknownPowerCount++;
      unknownPowerComponents.push(comp.name);
      componentBreakdown.push({ name: comp.name, powerWatts: 0, isUnknown: true });
    }

    const idle = sanitizeNumber(comp.idlePowerWatts);
    const max = sanitizeNumber(comp.maxPowerWatts);

    if (idle != null) {
      totalIdlePowerWatts += idle;
      hasIdleData = true;
    }
    if (max != null) {
      totalMaxPowerWatts += max;
      hasMaxData = true;
    }
  }

  return {
    totalKnownPowerWatts,
    knownComponentCount,
    unknownPowerCount,
    unknownPowerComponents,
    totalIdlePowerWatts: hasIdleData ? totalIdlePowerWatts : null,
    totalMaxPowerWatts: hasMaxData ? totalMaxPowerWatts : null,
    hasIdleData,
    hasMaxData,
    componentBreakdown,
  };
}

export function calculateEnergy(
  powerResult: PowerResult,
  electricityCostPerKwh: number,
  currency: import('@/types').Currency
): import('./types').EnergyResult {
  const estimatedContinuousPowerWatts = powerResult.totalKnownPowerWatts;

  if (estimatedContinuousPowerWatts <= 0) {
    return {
      estimatedContinuousPowerWatts: 0,
      hasPowerData: false,
      unknownPowerCount: powerResult.unknownPowerCount,
      monthlyKwh: 0,
      annualKwh: 0,
      electricityCostPerKwh,
      monthlyCost: 0,
      annualCost: 0,
      currency,
    };
  }

  const monthlyKwh = (estimatedContinuousPowerWatts / 1000) * 24 * 30.4375;
  const annualKwh = (estimatedContinuousPowerWatts / 1000) * 24 * 365;

  return {
    estimatedContinuousPowerWatts,
    hasPowerData: true,
    unknownPowerCount: powerResult.unknownPowerCount,
    monthlyKwh,
    annualKwh,
    electricityCostPerKwh,
    monthlyCost: monthlyKwh * electricityCostPerKwh,
    annualCost: annualKwh * electricityCostPerKwh,
    currency,
  };
}
