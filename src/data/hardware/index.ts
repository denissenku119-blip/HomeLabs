import type { HardwareDefinition } from '@/types';
import { computeHardware } from '@/data/hardware/compute';
import { storageHardware } from '@/data/hardware/storage';
import { networkingHardware } from '@/data/hardware/networking';
import { powerHardware } from '@/data/hardware/power';
import { otherHardware } from '@/data/hardware/other';

export const hardwareCatalog: HardwareDefinition[] = [
  ...computeHardware,
  ...storageHardware,
  ...networkingHardware,
  ...powerHardware,
  ...otherHardware,
];

export const hardwareById = new Map<string, HardwareDefinition>(
  hardwareCatalog.map((hw) => [hw.id, hw])
);

export function getHardwareById(id: string): HardwareDefinition | undefined {
  return hardwareById.get(id);
}
