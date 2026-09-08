import type { HardwareDefinition, ComponentCategory } from '@/types';

export interface SearchFilters {
  query: string;
  category: ComponentCategory | 'all';
}

export function searchHardware(
  catalog: HardwareDefinition[],
  filters: SearchFilters
): HardwareDefinition[] {
  const { query, category } = filters;
  const q = query.trim().toLowerCase();

  return catalog.filter((hw) => {
    if (category !== 'all' && hw.category !== category) return false;
    if (!q) return true;

    return (
      hw.name.toLowerCase().includes(q) ||
      hw.manufacturer.toLowerCase().includes(q) ||
      hw.model.toLowerCase().includes(q) ||
      hw.category.toLowerCase().includes(q) ||
      hw.subcategory?.toLowerCase().includes(q) ||
      hw.description.toLowerCase().includes(q) ||
      hw.useCases.some((uc) => uc.toLowerCase().includes(q)) ||
      `${hw.networkSpeedGbps}gb`.includes(q) ||
      `${hw.networkSpeedGbps}gbe`.includes(q)
    );
  });
}

export function groupByCategory(
  items: HardwareDefinition[]
): Map<ComponentCategory, HardwareDefinition[]> {
  const map = new Map<ComponentCategory, HardwareDefinition[]>();
  for (const hw of items) {
    const arr = map.get(hw.category) ?? [];
    arr.push(hw);
    map.set(hw.category, arr);
  }
  return map;
}
