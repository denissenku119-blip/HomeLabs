import type { ProjectComponent, ComponentCategory, Currency } from '@/types';
import type { CostResult, CostBreakdownItem } from './types';

function sanitizeNumber(value: number | undefined | null): number | null {
  if (value == null || isNaN(value) || value < 0) return null;
  return value;
}

const CATEGORY_ORDER: ComponentCategory[] = [
  'compute', 'storage', 'networking', 'power', 'virtualization', 'security', 'other',
];

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  compute: 'Compute',
  storage: 'Storage',
  networking: 'Networking',
  power: 'Power',
  virtualization: 'Virtualization',
  security: 'Security',
  other: 'Other',
};

export { CATEGORY_ORDER, CATEGORY_LABELS };

export function calculateCost(
  components: ProjectComponent[],
  currency: Currency
): CostResult {
  const breakdownMap = new Map<ComponentCategory, CostBreakdownItem>();
  let totalKnownCost = 0;
  let knownComponentCount = 0;
  const unpricedComponents: string[] = [];

  for (const comp of components) {
    const price = sanitizeNumber(comp.price);
    const cat = comp.category;

    if (!breakdownMap.has(cat)) {
      breakdownMap.set(cat, { category: cat, amount: 0, componentCount: 0 });
    }
    const item = breakdownMap.get(cat)!;

    if (price != null && price > 0) {
      totalKnownCost += price;
      knownComponentCount++;
      item.amount += price;
    } else {
      unpricedComponents.push(comp.name);
    }
    item.componentCount++;
  }

  const breakdown = CATEGORY_ORDER
    .filter((cat) => breakdownMap.has(cat))
    .map((cat) => breakdownMap.get(cat)!)
    .filter((item) => item.componentCount > 0);

  return {
    totalKnownCost,
    knownComponentCount,
    unpricedComponentCount: unpricedComponents.length,
    unpricedComponents,
    breakdown,
    currency,
  };
}
