import type { ConnectionType, Connection, HardwareDefinition, ProjectComponent } from '@/types';
import { getHardwareById } from '@/data/hardware';
import { createConnection, createProjectComponentFromHardware } from '@/utils/projectStore';

/** Device types offered by setup. Each maps onto an existing catalog item. */
export interface DeviceType {
  id: string;
  labelKey: string;
  group: 'networking' | 'computing' | 'storage' | 'power' | 'other';
  defaultHardwareId: string;
  /** Which devices may be linked to this one in the quick-connect step. */
  hub?: { type: ConnectionType; accepts: DeviceType['group'][] | string[] };
  tier: number;
}

export const DEVICE_TYPES: DeviceType[] = [
  { id: 'router', labelKey: 'mylab.type.router', group: 'networking', defaultHardwareId: 'hw-basic-router', tier: 0, hub: { type: 'ethernet', accepts: ['networking', 'computing', 'storage'] } },
  { id: 'firewall', labelKey: 'mylab.type.firewall', group: 'networking', defaultHardwareId: 'hw-firewall-appliance', tier: 0, hub: { type: 'ethernet', accepts: ['networking', 'computing', 'storage'] } },
  { id: 'switch', labelKey: 'mylab.type.switch', group: 'networking', defaultHardwareId: 'hw-unmanaged-switch', tier: 1, hub: { type: 'ethernet', accepts: ['networking', 'computing', 'storage'] } },
  { id: 'ap', labelKey: 'mylab.type.ap', group: 'networking', defaultHardwareId: 'hw-wifi-ap', tier: 2 },
  { id: 'server', labelKey: 'mylab.type.server', group: 'computing', defaultHardwareId: 'hw-used-1u-server', tier: 2, hub: { type: 'storage', accepts: ['hdd', 'ssd', 'external'] } },
  { id: 'minipc', labelKey: 'mylab.type.minipc', group: 'computing', defaultHardwareId: 'hw-mini-pc', tier: 2, hub: { type: 'storage', accepts: ['hdd', 'ssd', 'external'] } },
  { id: 'desktop', labelKey: 'mylab.type.desktop', group: 'computing', defaultHardwareId: 'hw-desktop-workstation', tier: 2, hub: { type: 'storage', accepts: ['hdd', 'ssd', 'external'] } },
  { id: 'sbc', labelKey: 'mylab.type.sbc', group: 'computing', defaultHardwareId: 'hw-raspberry-pi', tier: 2 },
  { id: 'nas', labelKey: 'mylab.type.nas', group: 'storage', defaultHardwareId: 'hw-2bay-nas', tier: 2, hub: { type: 'storage', accepts: ['hdd', 'ssd', 'external'] } },
  { id: 'hdd', labelKey: 'mylab.type.hdd', group: 'storage', defaultHardwareId: 'hw-nas-hdd-4tb', tier: 3 },
  { id: 'ssd', labelKey: 'mylab.type.ssd', group: 'storage', defaultHardwareId: 'hw-sata-ssd-1tb', tier: 3 },
  { id: 'external', labelKey: 'mylab.type.external', group: 'storage', defaultHardwareId: 'hw-usb-backup-4tb', tier: 3 },
  { id: 'ups', labelKey: 'mylab.type.ups', group: 'power', defaultHardwareId: 'hw-small-ups', tier: 4, hub: { type: 'power', accepts: ['networking', 'computing', 'storage', 'pdu'] } },
  { id: 'pdu', labelKey: 'mylab.type.pdu', group: 'power', defaultHardwareId: 'hw-pdu', tier: 4, hub: { type: 'power', accepts: ['networking', 'computing', 'storage'] } },
  { id: 'rack', labelKey: 'mylab.type.rack', group: 'other', defaultHardwareId: 'hw-rack-cabinet', tier: 5 },
  { id: 'patch', labelKey: 'mylab.type.patch', group: 'other', defaultHardwareId: 'hw-patch-panel', tier: 5 },
  { id: 'nic', labelKey: 'mylab.type.nic', group: 'other', defaultHardwareId: 'hw-pcie-nic', tier: 5 },
].filter((t) => !!getHardwareById(t.defaultHardwareId)) as DeviceType[];

export const DEVICE_GROUPS: DeviceType['group'][] = ['networking', 'computing', 'storage', 'power', 'other'];

export function getDeviceType(id: string): DeviceType | undefined {
  return DEVICE_TYPES.find((t) => t.id === id);
}

/** A device being configured during setup (a draft ProjectComponent). */
export interface DraftDevice {
  key: string;
  typeId: string;
  component: ProjectComponent;
}

export function makeDraftDevice(typeId: string, index: number, hw?: HardwareDefinition): DraftDevice | null {
  const type = getDeviceType(typeId);
  const def = hw ?? (type ? getHardwareById(type.defaultHardwareId) : undefined);
  if (!type || !def) return null;
  const component = createProjectComponentFromHardware(def, 0, 0);
  return { key: component.instanceId, typeId, component: { ...component, name: index > 1 ? `${def.name} ${index}` : def.name } };
}

export function canLink(hub: DraftDevice, other: DraftDevice): boolean {
  if (hub.key === other.key) return false;
  const hubType = getDeviceType(hub.typeId);
  const otherType = getDeviceType(other.typeId);
  if (!hubType?.hub || !otherType) return false;
  const accepts = hubType.hub.accepts as string[];
  return accepts.includes(otherType.id) || accepts.includes(otherType.group);
}

/** Lays devices out in tiers (internet edge → switching → devices → drives → power). */
export function layoutDevices(devices: DraftDevice[]): ProjectComponent[] {
  const byTier = new Map<number, DraftDevice[]>();
  for (const d of devices) {
    const tier = getDeviceType(d.typeId)?.tier ?? 5;
    byTier.set(tier, [...(byTier.get(tier) ?? []), d]);
  }
  const tiers = [...byTier.keys()].sort((a, b) => a - b);
  const out: ProjectComponent[] = [];
  tiers.forEach((tier, row) => {
    const items = byTier.get(tier) ?? [];
    items.forEach((d, col) => {
      out.push({ ...d.component, x: 40 + col * 200, y: 40 + row * 170 });
    });
  });
  return out;
}

export function buildConnections(
  devices: DraftDevice[],
  links: Record<string, string[]>,
): Connection[] {
  const seen = new Set<string>();
  const result: Connection[] = [];
  for (const hub of devices) {
    const type = getDeviceType(hub.typeId)?.hub?.type;
    if (!type) continue;
    for (const otherKey of links[hub.key] ?? []) {
      const pair = [hub.key, otherKey].sort().join('|') + type;
      if (seen.has(pair) || !devices.some((d) => d.key === otherKey)) continue;
      seen.add(pair);
      result.push(createConnection(hub.key, otherKey, type));
    }
  }
  return result;
}
