import type { ProjectComponent } from '@/types';
import type { StorageResult } from './types';

function sanitizeNumber(value: number | undefined | null): number | null {
  if (value == null || isNaN(value) || value < 0) return null;
  return value;
}

export function calculateStorage(components: ProjectComponent[]): StorageResult {
  let totalRawStorageTB = 0;
  let hasStorageData = false;
  let unknownStorageCount = 0;
  let storageDeviceCount = 0;
  let nasCount = 0;
  let knownDriveBays = 0;
  let unknownDriveBaysCount = 0;
  let hasAnyDriveBayData = false;

  const componentBreakdown: StorageResult['componentBreakdown'] = [];

  for (const comp of components) {
    const storage = sanitizeNumber(comp.storageTB);
    const driveBays = sanitizeNumber(comp.driveBays);

    const isNas = comp.category === 'storage' && (comp.subcategory === 'NAS' || comp.driveBays != null);
    const isStorageDevice = comp.category === 'storage' && comp.formFactor === 'drive';

    if (storage != null && storage > 0) {
      totalRawStorageTB += storage;
      hasStorageData = true;
      componentBreakdown.push({
        name: comp.name,
        storageTB: storage,
        driveBays: driveBays ?? undefined,
        isUnknown: false,
      });
    } else if (comp.category === 'storage') {
      unknownStorageCount++;
      componentBreakdown.push({
        name: comp.name,
        storageTB: 0,
        driveBays: driveBays ?? undefined,
        isUnknown: true,
      });
    }

    if (isStorageDevice) storageDeviceCount++;
    if (isNas) nasCount++;

    if (driveBays != null && driveBays > 0) {
      knownDriveBays += driveBays;
      hasAnyDriveBayData = true;
    } else if (isNas && (driveBays == null || driveBays === 0)) {
      unknownDriveBaysCount++;
    }
  }

  return {
    totalRawStorageTB,
    hasStorageData,
    unknownStorageCount,
    storageDeviceCount,
    nasCount,
    knownDriveBays: hasAnyDriveBayData ? knownDriveBays : null,
    unknownDriveBaysCount,
    componentBreakdown,
  };
}
