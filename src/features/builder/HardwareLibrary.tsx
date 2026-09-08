import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Wrench,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Server,
  Box,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import type { HardwareDefinition, ComponentCategory } from '@/types';
import { hardwareCatalog } from '@/data/hardware';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_ORDER } from '@/data/constants';
import { searchHardware, groupByCategory } from '@/utils/hardwareSearch';
import { formatCost, formatPower, formatStorage, formatNetwork } from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface HardwareLibraryProps {
  onAdd: (hw: HardwareDefinition) => void;
  onAddCustom: () => void;
  compact?: boolean;
}

type FilterCategory = ComponentCategory | 'all';

const FILTER_OPTIONS: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'compute', label: 'Compute' },
  { value: 'storage', label: 'Storage' },
  { value: 'networking', label: 'Networking' },
  { value: 'power', label: 'Power' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

export function HardwareLibrary({ onAdd, onAddCustom, compact }: HardwareLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [expanded, setExpanded] = useState<Set<ComponentCategory>>(
    new Set(['compute', 'networking'])
  );
  const [detailHardware, setDetailHardware] = useState<HardwareDefinition | null>(null);

  const filtered = useMemo(
    () => searchHardware(hardwareCatalog, { query: search, category: activeFilter }),
    [search, activeFilter]
  );

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  const toggleCategory = useCallback((cat: ComponentCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  if (detailHardware) {
    return (
      <HardwareDetailPanel
        hardware={detailHardware}
        onAdd={(hw) => {
          onAdd(hw);
          setDetailHardware(null);
        }}
        onBack={() => setDetailHardware(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-base-100">Hardware Library</h2>
        <p className="text-2xs text-base-400 mt-0.5">
          {compact ? 'Tap to inspect or add' : 'Browse, inspect, and add hardware'}
        </p>
      </div>

      <div className="p-2.5 flex-shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-400" />
          <input
            type="text"
            placeholder="Search hardware..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            aria-label="Search hardware"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={cn(
                'px-2 py-1 text-2xs font-medium rounded-md whitespace-nowrap transition-colors',
                activeFilter === opt.value
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-base-850 text-base-300 border border-base-700 hover:text-base-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-3">
        {filtered.length === 0 && (
          <div className="text-center py-6">
            <Search className="w-6 h-6 text-base-600 mx-auto mb-2" />
            <p className="text-xs text-base-400">No hardware found.</p>
            <p className="text-2xs text-base-500 mt-1">Try a different search or filter.</p>
          </div>
        )}

        {CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat) ?? [];
          if (items.length === 0) return null;
          const isOpen = expanded.has(cat) || !!search || activeFilter === cat;
          const Icon = CATEGORY_ICONS[cat];

          return (
            <div key={cat} className="mb-1.5">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-base-200 hover:text-base-100 hover:bg-base-800 rounded-md transition-colors"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-base-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-base-400" />
                )}
                <Icon className="w-3.5 h-3.5 text-base-300" />
                {CATEGORY_LABELS[cat]}
                <span className="ml-auto text-2xs text-base-400 font-normal">
                  {items.length}
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-1 mt-0.5 mb-1">
                  {items.map((hw) => (
                    <HardwareCard
                      key={hw.id}
                      hardware={hw}
                      onClick={() => setDetailHardware(hw)}
                      onAdd={() => onAdd(hw)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-2.5 py-2 border-t border-base-700 flex-shrink-0">
        <button
          onClick={onAddCustom}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-base-850 border border-base-600 text-base-200 hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Wrench className="w-3.5 h-3.5" />
          Add Custom Hardware
        </button>
      </div>
    </div>
  );
}

function HardwareCard({
  hardware: hw,
  onClick,
  onAdd,
}: {
  hardware: HardwareDefinition;
  onClick: () => void;
  onAdd: () => void;
}) {
  const Icon = CATEGORY_ICONS[hw.category] ?? Box;
  const hasSpecs = hw.cpuCores || hw.ramGB || hw.networkSpeedGbps || hw.driveBays;

  return (
    <div
      className={cn(
        'group flex items-start gap-2 px-2 py-1.5 rounded-md text-left',
        'bg-base-850 border border-base-700 hover:border-accent/40 hover:bg-base-800 transition-colors cursor-pointer'
      )}
      onClick={onClick}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded bg-base-800 text-base-300 flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-base-100 truncate leading-tight">{hw.name}</p>
        <p className="text-2xs text-base-400 truncate leading-tight">
          {hw.manufacturer !== 'Generic' ? hw.manufacturer : hw.subcategory ?? hw.description}
        </p>
        {hasSpecs && (
          <div className="flex flex-wrap gap-1 mt-1">
            {hw.ramGB != null && hw.ramGB > 0 && (
              <Badge>{hw.ramGB}GB RAM</Badge>
            )}
            {hw.networkSpeedGbps > 0 && (
              <Badge>{formatNetwork(hw.networkSpeedGbps)}</Badge>
            )}
            {hw.driveBays != null && hw.driveBays > 0 && (
              <Badge>{hw.driveBays}-Bay</Badge>
            )}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="flex items-center justify-center w-6 h-6 rounded-md bg-base-800 border border-base-600 text-base-400 hover:text-accent hover:border-accent transition-colors flex-shrink-0"
        aria-label={`Add ${hw.name} to architecture`}
        title="Add to architecture"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-2xs font-mono font-medium rounded bg-base-800 border border-base-700 text-base-300">
      {children}
    </span>
  );
}

function HardwareDetailPanel({
  hardware: hw,
  onAdd,
  onBack,
}: {
  hardware: HardwareDefinition;
  onAdd: (hw: HardwareDefinition) => void;
  onBack: () => void;
}) {
  const Icon = CATEGORY_ICONS[hw.category] ?? Box;
  const sourceLabel = {
    estimate: 'Estimated',
    typical: 'Typical',
    manufacturer: 'Manufacturer spec',
    user: 'User entered',
  }[hw.specSourceType];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-2xs text-base-400 hover:text-base-100 transition-colors mb-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to library
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-md bg-accent/15 text-accent flex-shrink-0">
            <Icon className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-base-50 truncate">{hw.name}</h2>
            <p className="text-2xs text-base-400 truncate">
              {hw.manufacturer} {hw.model}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs text-base-300 leading-relaxed mb-4">{hw.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {hw.typicalPrice > 0 && (
            <DetailStat
              icon={<span className="text-xs font-bold">$</span>}
              label="Typical price"
              value={formatCost(hw.typicalPrice, hw.currency)}
              sub={sourceLabel}
            />
          )}
          {hw.powerWatts > 0 && (
            <DetailStat
              icon={<Zap className="w-3 h-3" />}
              label="Power"
              value={formatPower(hw.powerWatts)}
              sub={hw.idlePowerWatts != null ? `${hw.idlePowerWatts}W idle / ${hw.maxPowerWatts ?? hw.powerWatts}W max` : sourceLabel}
            />
          )}
          {hw.storageTB > 0 && (
            <DetailStat
              icon={<HardDrive className="w-3 h-3" />}
              label="Raw storage"
              value={formatStorage(hw.storageTB)}
              sub="Raw capacity"
            />
          )}
          {hw.networkSpeedGbps > 0 && (
            <DetailStat
              icon={<Network className="w-3 h-3" />}
              label="Network"
              value={formatNetwork(hw.networkSpeedGbps)}
              sub={hw.networkPorts ? `${hw.networkPorts} ports` : undefined}
            />
          )}
          {hw.cpuCores != null && hw.cpuCores > 0 && (
            <DetailStat
              icon={<Cpu className="w-3 h-3" />}
              label="CPU cores"
              value={String(hw.cpuCores)}
            />
          )}
          {hw.ramGB != null && hw.ramGB > 0 && (
            <DetailStat
              icon={<Server className="w-3 h-3" />}
              label="RAM"
              value={`${hw.ramGB}GB`}
              sub={hw.expandableRam ? 'Expandable' : undefined}
            />
          )}
          {hw.driveBays != null && hw.driveBays > 0 && (
            <DetailStat
              icon={<Layers className="w-3 h-3" />}
              label="Drive bays"
              value={String(hw.driveBays)}
              sub="Drives not included"
            />
          )}
          {hw.formFactor && (
            <DetailStat
              icon={<Box className="w-3 h-3" />}
              label="Form factor"
              value={formatFormFactor(hw.formFactor)}
            />
          )}
        </div>

        {hw.useCases.length > 0 && (
          <div className="mb-4">
            <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-2">
              Best for
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {hw.useCases.map((uc) => (
                <span
                  key={uc}
                  className="inline-flex items-center px-2 py-1 text-2xs font-medium rounded-md bg-base-850 border border-base-700 text-base-200"
                >
                  {uc}
                </span>
              ))}
            </div>
          </div>
        )}

        {hw.virtualizationSupport && (
          <div className="mb-4 flex items-center gap-2 px-2.5 py-2 rounded-md bg-accent/10 border border-accent/20">
            <Server className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <p className="text-2xs text-accent font-medium">
              Supports virtualization (Proxmox, ESXi, Docker)
            </p>
          </div>
        )}

        {hw.notes && (
          <div className="mb-4 px-2.5 py-2 rounded-md bg-base-850 border border-base-700">
            <p className="text-2xs text-base-400 leading-relaxed">{hw.notes}</p>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-2xs text-base-500 mb-4">
          <span className="px-1.5 py-0.5 rounded bg-base-850 border border-base-700 font-mono">
            {sourceLabel}
          </span>
          <span>Values are planning estimates, not exact specifications.</span>
        </div>
      </div>

      <div className="px-3 py-2.5 border-t border-base-700 flex-shrink-0">
        <button
          onClick={() => onAdd(hw)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add to Architecture
        </button>
      </div>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="px-2.5 py-2 rounded-md bg-base-850 border border-base-700">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-base-400">{icon}</span>
        <span className="text-2xs text-base-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-mono font-semibold text-base-100">{value}</p>
      {sub && <p className="text-2xs text-base-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const FORM_FACTOR_LABELS: Record<string, string> = {
  'mini-pc': 'Mini PC',
  nuc: 'NUC',
  sff: 'Small Form Factor',
  desktop: 'Desktop',
  tower: 'Tower',
  'rack-1u': '1U Rack',
  'rack-2u': '2U Rack',
  'rack-4u': '4U Rack',
  sbc: 'Single-board',
  'nas-desktop': 'Desktop NAS',
  'rackmount-nas': 'Rackmount NAS',
  ap: 'Access Point',
  'desktop-router': 'Desktop',
  'rack-router': 'Rack Router',
  'ups-tower': 'Tower UPS',
  'ups-rack': 'Rack UPS',
  pdu: 'PDU',
  drive: 'Drive',
  external: 'External',
  card: 'PCIe Card',
  adapter: 'Adapter',
  panel: 'Panel',
  cabinet: 'Cabinet',
  'wall-mount': 'Wall Mount',
  custom: 'Custom',
};

function formatFormFactor(ff: string): string {
  return FORM_FACTOR_LABELS[ff] ?? ff;
}
