import type { ProjectComponent, Connection } from '@/types';
import type { NetworkResult, NetworkConnectionInfo } from './types';

function sanitizeNumber(value: number | undefined | null): number | null {
  if (value == null || isNaN(value) || value < 0) return null;
  return value;
}

function getEffectiveSpeed(
  from: ProjectComponent,
  to: ProjectComponent
): number | null {
  const fromSpeed = sanitizeNumber(from.networkSpeedGbps);
  const toSpeed = sanitizeNumber(to.networkSpeedGbps);

  if (fromSpeed == null && toSpeed == null) return null;
  if (fromSpeed == null || toSpeed == null) return fromSpeed ?? toSpeed;
  return Math.min(fromSpeed, toSpeed);
}

const VARIABLE_TYPES = new Set(['wifi', 'power', 'other']);

export function calculateNetwork(
  components: ProjectComponent[],
  connections: Connection[]
): NetworkResult {
  let fastestInterfaceGbps: number | null = null;
  let networkCapableCount = 0;
  let unknownNetworkCount = 0;

  const componentMap = new Map<string, ProjectComponent>();
  for (const comp of components) {
    componentMap.set(comp.instanceId, comp);

    const speed = sanitizeNumber(comp.networkSpeedGbps);
    if (speed != null && speed > 0) {
      networkCapableCount++;
      if (fastestInterfaceGbps == null || speed > fastestInterfaceGbps) {
        fastestInterfaceGbps = speed;
      }
    } else if (comp.category === 'networking' || comp.category === 'security' || comp.category === 'compute') {
      unknownNetworkCount++;
    }
  }

  const connInfos: NetworkConnectionInfo[] = [];
  let knownEffectiveLinks = 0;
  let unknownLinks = 0;

  for (const conn of connections) {
    const from = componentMap.get(conn.fromId);
    const to = componentMap.get(conn.toId);
    if (!from || !to) continue;

    if (VARIABLE_TYPES.has(conn.type)) {
      unknownLinks++;
      connInfos.push({
        connectionId: conn.id,
        fromName: from.name,
        toName: to.name,
        effectiveSpeedGbps: null,
        isUnknown: true,
        connectionType: conn.type,
      });
      continue;
    }

    const effective = getEffectiveSpeed(from, to);
    if (effective == null) {
      unknownLinks++;
      connInfos.push({
        connectionId: conn.id,
        fromName: from.name,
        toName: to.name,
        effectiveSpeedGbps: null,
        isUnknown: true,
        connectionType: conn.type,
      });
    } else {
      knownEffectiveLinks++;
      connInfos.push({
        connectionId: conn.id,
        fromName: from.name,
        toName: to.name,
        effectiveSpeedGbps: effective,
        isUnknown: false,
        connectionType: conn.type,
      });
    }
  }

  return {
    fastestInterfaceGbps,
    networkCapableCount,
    unknownNetworkCount,
    connectionCount: connections.length,
    knownEffectiveLinks,
    unknownLinks,
    connections: connInfos,
  };
}
