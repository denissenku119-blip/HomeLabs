import type { ProjectComponent, Connection, AnalysisResult } from '@/types';
import { CURRENCY_SYMBOLS } from '@/data/constants';
import { calculateCost } from '@/features/calculations/costCalculations';
import { calculatePower } from '@/features/calculations/powerCalculations';
import { calculateStorage } from '@/features/calculations/storageCalculations';
import { calculateNetwork } from '@/features/calculations/networkCalculations';

export function calculateAnalysis(
  components: ProjectComponent[],
  _connections: Connection[]
): AnalysisResult {
  void _connections;
  const cost = calculateCost(components, 'USD');
  const power = calculatePower(components);
  const storage = calculateStorage(components);
  const network = calculateNetwork(components, _connections);

  return {
    totalCost: cost.totalKnownCost,
    totalPowerWatts: power.totalKnownPowerWatts,
    totalStorageTB: storage.totalRawStorageTB,
    maxNetworkSpeedGbps: network.fastestInterfaceGbps ?? 0,
    componentCount: components.length,
  };
}

export function formatCost(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return '—';
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? '$';
  return `${symbol}${amount.toLocaleString('en-US')}`;
}

export function formatPower(watts: number): string {
  if (watts === 0) return '—';
  return `${watts}W`;
}

export function formatStorage(tb: number): string {
  if (tb === 0) return '—';
  if (tb >= 1) return `${tb % 1 === 0 ? tb.toFixed(0) : tb.toFixed(1)}TB`;
  const gb = Math.round(tb * 1024);
  return `${gb}GB`;
}

export function formatNetwork(gbps: number): string {
  if (gbps === 0) return '—';
  if (gbps >= 1) return `${gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)}GbE`;
  return `${Math.round(gbps * 1000)}MbE`;
}

export function formatValue(value: number, formatter: (v: number) => string): string {
  if (value === undefined || value === null || isNaN(value)) return 'Not specified';
  if (value === 0) return 'Not specified';
  return formatter(value);
}
