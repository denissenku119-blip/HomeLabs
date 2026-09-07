import { useState, useEffect } from 'react';
import { Copy, Trash2, Link2, X, Cpu, DollarSign, Zap, HardDrive, Network, Tag, StickyNote } from 'lucide-react';
import type { ProjectComponent, Connection, ConnectionType, Currency } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CONNECTION_TYPE_LABELS, CONNECTION_TYPE_COLORS } from '@/data/constants';
import { formatCost, formatPower, formatStorage, formatNetwork, formatValue } from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface NodeDetailsPanelProps {
  component: ProjectComponent | null;
  connections: Connection[];
  allComponents: ProjectComponent[];
  connectingFromId: string | null;
  pendingConnectionType: ConnectionType;
  onUpdate: (instanceId: string, updates: Partial<ProjectComponent>) => void;
  onDelete: (instanceId: string) => void;
  onDuplicate: (instanceId: string) => void;
  onStartConnecting: (instanceId: string) => void;
  onCancelConnecting: () => void;
  onSetConnectionType: (type: ConnectionType) => void;
  onSelectNode: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onClose: () => void;
}

export function NodeDetailsPanel({
  component,
  connections,
  allComponents,
  connectingFromId,
  pendingConnectionType,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartConnecting,
  onCancelConnecting,
  onSetConnectionType,
  onSelectNode,
  onDeleteConnection,
  onClose,
}: NodeDetailsPanelProps) {
  if (!component) {
    return <OverviewPanel components={allComponents} />;
  }

  return (
    <DetailsEditor
      component={component}
      connections={connections}
      allComponents={allComponents}
      connectingFromId={connectingFromId}
      pendingConnectionType={pendingConnectionType}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onStartConnecting={onStartConnecting}
      onCancelConnecting={onCancelConnecting}
      onSetConnectionType={onSetConnectionType}
      onSelectNode={onSelectNode}
      onDeleteConnection={onDeleteConnection}
      onClose={onClose}
    />
  );
}

function OverviewPanel({ components }: { components: ProjectComponent[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-base-100">Architecture Overview</h2>
        <p className="text-2xs text-base-400 mt-0.5">Select a node to edit details</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {components.length === 0 ? (
          <div className="text-center py-8">
            <Cpu className="w-8 h-8 text-base-600 mx-auto mb-3" />
            <p className="text-xs text-base-400">
              No components placed yet.
              <br />
              Add components to see an overview.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {components.map((c) => {
              const Icon = CATEGORY_ICONS[c.category];
              return (
                <div
                  key={c.instanceId}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-base-850 border border-base-700"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded bg-base-800 text-base-200 flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-base-100 truncate">{c.name}</p>
                    <p className="text-2xs text-base-400 truncate">
                      {formatValue(c.powerWatts, formatPower)} • {formatValue(c.storageTB, formatStorage)}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-accent">
                    {c.price > 0 ? formatCost(c.price, c.currency) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsEditor({
  component,
  connections,
  allComponents,
  connectingFromId,
  pendingConnectionType,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartConnecting,
  onCancelConnecting,
  onSetConnectionType,
  onSelectNode,
  onDeleteConnection,
  onClose,
}: Omit<NodeDetailsPanelProps, 'component'> & { component: ProjectComponent }) {
  const Icon = CATEGORY_ICONS[component.category];
  const compConnections = connections.filter(
    (c) => c.fromId === component.instanceId || c.toId === component.instanceId
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/15 text-accent flex-shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-base-50 truncate">{component.name}</h2>
              <p className="text-2xs text-base-400">{CATEGORY_LABELS[component.category]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-base-400 hover:text-base-100 hover:bg-base-800 transition-colors flex-shrink-0"
            aria-label="Close details panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <QuickStat icon={<DollarSign className="w-3 h-3" />} label="Price" value={formatValue(component.price, (v) => formatCost(v, component.currency as Currency))} />
          <QuickStat icon={<Zap className="w-3 h-3" />} label="Power" value={formatValue(component.powerWatts, formatPower)} />
          <QuickStat icon={<HardDrive className="w-3 h-3" />} label="Storage" value={formatValue(component.storageTB, formatStorage)} />
          <QuickStat icon={<Network className="w-3 h-3" />} label="Network" value={formatValue(component.networkSpeedGbps, formatNetwork)} />
        </div>

        {/* Editable fields */}
        <div className="flex flex-col gap-3">
          <FieldRow icon={<Tag className="w-3 h-3" />} label="Name">
            <InlineInput
              value={component.name}
              onChange={(v) => onUpdate(component.instanceId, { name: v })}
              placeholder="Component name"
            />
          </FieldRow>
          <FieldRow label="Manufacturer">
            <InlineInput
              value={component.manufacturer}
              onChange={(v) => onUpdate(component.instanceId, { manufacturer: v })}
              placeholder="Manufacturer"
            />
          </FieldRow>
          <FieldRow label="Model">
            <InlineInput
              value={component.model}
              onChange={(v) => onUpdate(component.instanceId, { model: v })}
              placeholder="Model"
            />
          </FieldRow>
          <FieldRow label="Description">
            <textarea
              value={component.description}
              onChange={(e) => onUpdate(component.instanceId, { description: e.target.value })}
              placeholder="Brief description"
              rows={2}
              className="w-full px-2 py-1.5 text-xs rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-2">
            <FieldRow label="Price">
              <InlineInput
                type="number"
                value={String(component.price || '')}
                onChange={(v) => onUpdate(component.instanceId, { price: parseFloat(v) || 0 })}
                placeholder="0"
              />
            </FieldRow>
            <FieldRow label="Power (W)">
              <InlineInput
                type="number"
                value={String(component.powerWatts || '')}
                onChange={(v) => onUpdate(component.instanceId, { powerWatts: parseFloat(v) || 0 })}
                placeholder="0"
              />
            </FieldRow>
            <FieldRow label="Storage (TB)">
              <InlineInput
                type="number"
                step="0.1"
                value={String(component.storageTB || '')}
                onChange={(v) => onUpdate(component.instanceId, { storageTB: parseFloat(v) || 0 })}
                placeholder="0"
              />
            </FieldRow>
            <FieldRow label="Network (Gbps)">
              <InlineInput
                type="number"
                step="0.5"
                value={String(component.networkSpeedGbps || '')}
                onChange={(v) => onUpdate(component.instanceId, { networkSpeedGbps: parseFloat(v) || 0 })}
                placeholder="0"
              />
            </FieldRow>
          </div>

          <FieldRow icon={<StickyNote className="w-3 h-3" />} label="Notes">
            <textarea
              value={component.notes ?? ''}
              onChange={(e) => onUpdate(component.instanceId, { notes: e.target.value })}
              placeholder="Add notes about this component..."
              rows={3}
              className="w-full px-2 py-1.5 text-xs rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />
          </FieldRow>
        </div>

        {/* Connections */}
        <div className="mt-5 pt-4 border-t border-base-700">
          <h3 className="text-2xs font-semibold text-base-300 uppercase tracking-wide mb-2.5">
            Connections ({compConnections.length})
          </h3>

          {/* Connection mode */}
          {connectingFromId === component.instanceId ? (
            <div className="mb-3 p-2.5 rounded-md bg-accent/10 border border-accent/30">
              <p className="text-2xs text-accent font-medium mb-2">
                Click another node to connect
              </p>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {(Object.keys(CONNECTION_TYPE_LABELS) as ConnectionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onSetConnectionType(t)}
                    className={cn(
                      'px-2 py-1 text-2xs font-medium rounded border transition-colors',
                      pendingConnectionType === t
                        ? 'text-base-950'
                        : 'bg-base-800 text-base-200 border-base-600 hover:text-base-100'
                    )}
                    style={
                      pendingConnectionType === t
                        ? { background: CONNECTION_TYPE_COLORS[t], borderColor: CONNECTION_TYPE_COLORS[t] }
                        : undefined
                    }
                  >
                    {CONNECTION_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <button
                onClick={onCancelConnecting}
                className="text-2xs text-base-400 hover:text-base-200 underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartConnecting(component.instanceId)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-base-850 border border-base-600 text-base-200 hover:text-accent hover:border-accent/40 transition-colors mb-3"
            >
              <Link2 className="w-3.5 h-3.5" />
              Start Connection
            </button>
          )}

          {/* Connection list */}
          {compConnections.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {compConnections.map((conn) => {
                const otherId = conn.fromId === component.instanceId ? conn.toId : conn.fromId;
                const other = allComponents.find((c) => c.instanceId === otherId);
                const color = CONNECTION_TYPE_COLORS[conn.type];
                return (
                  <div
                    key={conn.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-base-850 border border-base-700"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <button
                      onClick={() => other && onSelectNode(other.instanceId)}
                      className="text-xs text-base-100 hover:text-accent truncate flex-1 text-left"
                    >
                      {other?.name ?? 'Unknown'}
                    </button>
                    <span className="text-2xs text-base-400 flex-shrink-0">
                      {CONNECTION_TYPE_LABELS[conn.type]}
                    </span>
                    <button
                      onClick={() => onDeleteConnection(conn.id)}
                      className="p-0.5 text-base-400 hover:text-danger-400 transition-colors flex-shrink-0"
                      aria-label="Remove connection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-base-700 flex-shrink-0">
        <button
          onClick={() => onDuplicate(component.instanceId)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md bg-base-850 border border-base-600 text-base-200 hover:text-base-100 hover:bg-base-800 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>
        <button
          onClick={() => onDelete(component.instanceId)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md bg-base-850 border border-base-600 text-danger-400 hover:bg-danger-50/20 hover:border-danger-500/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 rounded-md bg-base-850 border border-base-700">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-base-400">{icon}</span>
        <span className="text-2xs text-base-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-mono font-semibold text-base-100">{value}</p>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-2xs font-medium text-base-300 uppercase tracking-wide">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <input
      type={type}
      step={step}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-xs rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
    />
  );
}
