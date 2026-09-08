import type { ProjectComponent, Connection, CompatibilityHint } from '@/types';
import { formatNetwork } from '@/utils/calculations';

export function getConnectionEffectiveSpeed(
  from: ProjectComponent,
  to: ProjectComponent
): number | null {
  const fromSpeed = from.networkSpeedGbps || 0;
  const toSpeed = to.networkSpeedGbps || 0;
  if (fromSpeed === 0 && toSpeed === 0) return null;
  if (fromSpeed === 0 || toSpeed === 0) return Math.max(fromSpeed, toSpeed);
  return Math.min(fromSpeed, toSpeed);
}

export function getConnectionHints(
  from: ProjectComponent,
  to: ProjectComponent
): CompatibilityHint[] {
  const hints: CompatibilityHint[] = [];

  const fromSpeed = from.networkSpeedGbps || 0;
  const toSpeed = to.networkSpeedGbps || 0;

  if (fromSpeed > 0 && toSpeed > 0 && fromSpeed !== toSpeed) {
    const effective = Math.min(fromSpeed, toSpeed);
    const faster = fromSpeed > toSpeed ? from : to;
    const slower = fromSpeed > toSpeed ? to : from;
    hints.push({
      id: `speed-mismatch-${from.instanceId}-${to.instanceId}`,
      severity: 'info',
      message: `Connection limited to ${formatNetwork(effective)} — ${slower.name} has a slower interface than ${faster.name}.`,
    });
  }

  if (fromSpeed === 0 && toSpeed === 0) {
    hints.push({
      id: `no-network-${from.instanceId}-${to.instanceId}`,
      severity: 'info',
      message: 'Network capability not specified for either device.',
    });
  }

  return hints;
}

export function getComponentConnectionHints(
  component: ProjectComponent,
  connections: Connection[],
  allComponents: ProjectComponent[]
): CompatibilityHint[] {
  const hints: CompatibilityHint[] = [];
  const compConnections = connections.filter(
    (c) => c.fromId === component.instanceId || c.toId === component.instanceId
  );

  for (const conn of compConnections) {
    const otherId = conn.fromId === component.instanceId ? conn.toId : conn.fromId;
    const other = allComponents.find((c) => c.instanceId === otherId);
    if (other) {
      hints.push(...getConnectionHints(component, other));
    }
  }

  return hints;
}
