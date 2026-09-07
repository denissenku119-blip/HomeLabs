import { Cpu, Zap, HardDrive, Network, DollarSign } from 'lucide-react';
import type { ProjectComponent, Connection, Currency } from '@/types';
import {
  calculateAnalysis,
  formatCost,
  formatPower,
  formatStorage,
  formatNetwork,
  formatValue,
} from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface ProjectSummaryProps {
  components: ProjectComponent[];
  connections: Connection[];
  currency: Currency;
  saved: boolean;
}

export function ProjectSummary({ components, connections, currency, saved }: ProjectSummaryProps) {
  const analysis = calculateAnalysis(components, connections);

  const items = [
    {
      label: 'Components',
      value: String(analysis.componentCount),
      icon: <Cpu className="w-3.5 h-3.5" />,
      show: true,
    },
    {
      label: 'Est. Investment',
      value: analysis.totalCost > 0 ? formatCost(analysis.totalCost, currency) : '—',
      icon: <DollarSign className="w-3.5 h-3.5" />,
      show: true,
    },
    {
      label: 'Power',
      value: formatValue(analysis.totalPowerWatts, formatPower),
      icon: <Zap className="w-3.5 h-3.5" />,
      show: true,
    },
    {
      label: 'Storage',
      value: formatValue(analysis.totalStorageTB, formatStorage),
      icon: <HardDrive className="w-3.5 h-3.5" />,
      show: true,
    },
    {
      label: 'Network',
      value: formatValue(analysis.maxNetworkSpeedGbps, formatNetwork),
      icon: <Network className="w-3.5 h-3.5" />,
      show: true,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-4 px-3 sm:px-4 py-2.5 border-t border-base-700 bg-base-900 flex-shrink-0 overflow-x-auto">
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-base-400">{item.icon}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-2xs text-base-400 uppercase tracking-wide">{item.label}</span>
              <span className={cn('text-xs font-mono font-semibold', item.label === 'Est. Investment' ? 'text-accent' : 'text-base-100')}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 text-2xs font-medium rounded-full border',
            saved
              ? 'bg-success-50/40 text-success-400 border-success-500/30'
              : 'bg-base-800 text-base-300 border-base-600'
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', saved ? 'bg-success-400' : 'bg-base-400 animate-pulse-subtle')} />
          {saved ? 'Saved' : 'Saving...'}
        </span>
      </div>
    </div>
  );
}
