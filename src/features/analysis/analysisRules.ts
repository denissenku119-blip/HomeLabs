import type { ProjectComponent, Connection } from '@/types';
import type { Finding, Severity } from './types';
import { formatNetwork, formatPower, formatCost } from '@/utils/calculations';

function makeFinding(
  ruleId: string,
  severity: Severity,
  category: Finding['category'],
  title: string,
  explanation: string,
  recommendation?: string,
  detail?: Finding['detail'],
  suffix?: string
): Finding {
  return {
    id: suffix ? `${ruleId}-${suffix}` : ruleId,
    ruleId,
    severity,
    category,
    title,
    explanation,
    recommendation,
    detail,
  };
}

function getConnectionPairs(
  components: ProjectComponent[],
  connections: Connection[]
): { from: ProjectComponent; to: ProjectComponent; conn: Connection }[] {
  const map = new Map(components.map((c) => [c.instanceId, c]));
  return connections
    .map((conn) => {
      const from = map.get(conn.fromId);
      const to = map.get(conn.toId);
      if (!from || !to) return null;
      return { from, to, conn };
    })
    .filter((p): p is { from: ProjectComponent; to: ProjectComponent; conn: Connection } => p !== null);
}

const VARIABLE_CONN_TYPES = new Set(['wifi', 'power', 'other']);

export function analyzeNetwork(ctx: {
  components: ProjectComponent[];
  connections: Connection[];
  componentRoles: { component: ProjectComponent; role: string }[];
}): Finding[] {
  const findings: Finding[] = [];
  const { components, connections, componentRoles } = ctx;

  const pairs = getConnectionPairs(components, connections);
  const componentIds = new Set(components.map((c) => c.instanceId));
  const connectedIds = new Set<string>();
  for (const p of pairs) {
    connectedIds.add(p.from.instanceId);
    connectedIds.add(p.to.instanceId);
  }

  const computeNodes = componentRoles.filter((r) => r.role === 'compute').map((r) => r.component);
  const routers = componentRoles.filter((r) => r.role === 'router').map((r) => r.component);

  for (const comp of computeNodes) {
    if (!connectedIds.has(comp.instanceId)) {
      findings.push(makeFinding(
        'compute-isolated', 'warning', 'network',
        `${comp.name} has no network connection`,
        `This compute node is not connected to any other device in the architecture.`,
        'Connect it to a switch or router so it can communicate with the network.',
        {
          detected: `${comp.name} is present but has no connections.`,
          whyItMatters: 'Without a network connection, the compute node cannot serve or access network resources.',
          whatYouCanDo: 'Add a connection from this device to a switch or router.',
        },
        comp.instanceId
      ));
    } else {
      findings.push(makeFinding(
        'compute-connected', 'good', 'network',
        `${comp.name} has a defined network connection`,
        'This compute node is connected to the network topology.',
        undefined, undefined, comp.instanceId
      ));
    }
  }

  for (const router of routers) {
    if (!connectedIds.has(router.instanceId)) {
      findings.push(makeFinding(
        'router-isolated', 'warning', 'network',
        `${router.name} is currently isolated`,
        'This router is present but not connected to any other device.',
        'Connect the router to a switch or other network device.',
        {
          detected: `${router.name} has no connections.`,
          whyItMatters: 'An isolated router cannot route traffic between devices.',
          whatYouCanDo: 'Connect the router to your switch or other network devices.',
        },
        router.instanceId
      ));
    }
  }

  for (const p of pairs) {
    if (VARIABLE_CONN_TYPES.has(p.conn.type)) continue;
    const fromSpeed = p.from.networkSpeedGbps || 0;
    const toSpeed = p.to.networkSpeedGbps || 0;
    if (fromSpeed > 0 && toSpeed > 0 && fromSpeed !== toSpeed) {
      const effective = Math.min(fromSpeed, toSpeed);
      const faster = fromSpeed > toSpeed ? p.from : p.to;
      const slower = fromSpeed > toSpeed ? p.to : p.from;
      findings.push(makeFinding(
        'network-bottleneck', 'warning', 'network',
        'Potential network bottleneck',
        `The link between ${faster.name} and ${slower.name} is limited to ${formatNetwork(effective)}. ${faster.name} supports up to ${formatNetwork(Math.max(fromSpeed, toSpeed))}, but this connection is limited by the slower device.`,
        'Consider upgrading the slower device if the faster speed is required.',
        {
          detected: `${faster.name} supports ${formatNetwork(Math.max(fromSpeed, toSpeed))} but ${slower.name} only supports ${formatNetwork(Math.min(fromSpeed, toSpeed))}.`,
          whyItMatters: 'The effective link speed is determined by the slower endpoint. The faster device cannot reach its full potential on this connection.',
          whatYouCanDo: 'Consider a switch or network adapter that matches the faster device\'s speed.',
        },
        p.conn.id
      ));
    }
  }

  for (const comp of components) {
    if (VARIABLE_CONN_TYPES.has('ethernet')) continue;
    const hasNetworkCapability = comp.networkSpeedGbps > 0;
    const hasConnections = connectedIds.has(comp.instanceId);
    if (!hasNetworkCapability && hasConnections && (comp.category === 'compute' || comp.category === 'networking')) {
      findings.push(makeFinding(
        'network-speed-unknown', 'info', 'network',
        `Network speed not specified for ${comp.name}`,
        'This device has connections but its network speed is unknown.',
        undefined, undefined, comp.instanceId
      ));
    }
  }

  void componentIds;
  return findings;
}

export function analyzeStorage(ctx: {
  components: ProjectComponent[];
  componentRoles: { component: ProjectComponent; role: string }[];
}): Finding[] {
  const findings: Finding[] = [];
  const { components, componentRoles } = ctx;

  const storageDevices = componentRoles.filter((r) => r.role === 'storage').map((r) => r.component);
  const backupDevices = componentRoles.filter((r) => r.role === 'backup').map((r) => r.component);
  const hasStorage = storageDevices.length > 0 || components.some((c) => c.storageTB > 0);
  const hasBackup = backupDevices.length > 0;

  if (storageDevices.length > 0) {
    findings.push(makeFinding(
      'storage-detected', 'good', 'storage',
      'Dedicated storage system detected',
      `Your architecture includes ${storageDevices.length} storage device${storageDevices.length !== 1 ? 's' : ''}.`,
      undefined, undefined
    ));
  }

  if (hasStorage && !hasBackup) {
    findings.push(makeFinding(
      'no-backup-destination', 'warning', 'backup',
      'No backup destination detected',
      'Your architecture contains storage, but no independent backup destination is currently modeled.',
      'Consider adding an external backup drive, second NAS, or backup server.',
      {
        detected: 'Primary storage is present, but no device with a backup role was found.',
        whyItMatters: 'Without a separate backup destination, data loss from drive failure, accidental deletion, or disaster could be unrecoverable.',
        whatYouCanDo: 'Consider adding an external USB drive, a second NAS, or a dedicated backup server as a separate backup destination.',
      }
    ));
  } else if (hasBackup) {
    findings.push(makeFinding(
      'backup-detected', 'good', 'backup',
      'Backup destination detected',
      'Your architecture includes a device that can serve as a backup destination.',
      undefined, undefined
    ));
  }

  return findings;
}

export function analyzePower(ctx: {
  components: ProjectComponent[];
  componentRoles: { component: ProjectComponent; role: string }[];
  metrics: import('@/features/calculations/types').ProjectMetrics | null;
}): Finding[] {
  const findings: Finding[] = [];
  const { components, componentRoles, metrics } = ctx;

  const upsDevices = componentRoles.filter((r) => r.role === 'power-protection').map((r) => r.component);
  const computeCount = componentRoles.filter((r) => r.role === 'compute').length;
  const storageCount = componentRoles.filter((r) => r.role === 'storage').length;
  const criticalDeviceCount = computeCount + storageCount;

  if (metrics && metrics.power.totalKnownPowerWatts > 0) {
    const power = metrics.power.totalKnownPowerWatts;
    if (power < 100) {
      findings.push(makeFinding(
        'power-low', 'good', 'power',
        'Estimated power demand is modest',
        `Your architecture has an estimated ${formatPower(power)} of known power consumption.`,
        undefined, undefined
      ));
    } else if (power > 300) {
      findings.push(makeFinding(
        'power-high', 'warning', 'power',
        'Power demand is becoming significant',
        `Your architecture has an estimated ${formatPower(power)} of known power consumption. This may impact electricity costs and cooling.`,
        'Consider reviewing power efficiency and ensuring adequate cooling.',
        {
          detected: `Estimated known power is ${formatPower(power)}.`,
          whyItMatters: 'Higher power consumption increases electricity costs and may require additional cooling capacity.',
          whatYouCanDo: 'Consider energy-efficient hardware, power management features, or consolidating services onto fewer devices.',
        }
      ));
    }
  }

  if (upsDevices.length > 0) {
    findings.push(makeFinding(
      'ups-detected', 'good', 'power',
      'UPS detected',
      'Your architecture includes power protection equipment.',
      undefined, undefined
    ));
  } else if (criticalDeviceCount >= 2) {
    findings.push(makeFinding(
      'no-ups', 'warning', 'power',
      'Power protection is not visible',
      'Your architecture has multiple critical devices but no UPS or power protection equipment is modeled.',
      'Consider adding a UPS to protect against power outages and surges.',
      {
        detected: `${criticalDeviceCount} critical devices (compute or storage) are present, but no UPS was found.`,
        whyItMatters: 'A sudden power outage could cause data corruption or service disruption. A UPS allows graceful shutdown and protects against surges.',
        whatYouCanDo: 'Consider adding a UPS sized for your estimated power load.',
      }
    ));
  }

  if (metrics && metrics.power.unknownPowerCount > 0) {
    findings.push(makeFinding(
      'power-unknown', 'info', 'power',
      `${metrics.power.unknownPowerCount} component${metrics.power.unknownPowerCount !== 1 ? 's' : ''} ha${metrics.power.unknownPowerCount === 1 ? 's' : 've'} no power estimate`,
      'Actual power consumption may be higher than the known estimate.',
      'Add power values to unmeasured components for more accurate estimates.',
      undefined, undefined
    ));
  }

  void components;
  return findings;
}

export function analyzeReliability(ctx: {
  components: ProjectComponent[];
  connections: Connection[];
  componentRoles: { component: ProjectComponent; role: string }[];
  isAdvanced: boolean;
}): Finding[] {
  const findings: Finding[] = [];
  const { components, connections, componentRoles, isAdvanced } = ctx;

  const switches = componentRoles.filter((r) => r.role === 'switch').map((r) => r.component);
  const pairs = getConnectionPairs(components, connections);
  const connectedIds = new Set<string>();
  for (const p of pairs) {
    connectedIds.add(p.from.instanceId);
    connectedIds.add(p.to.instanceId);
  }

  if (switches.length === 1) {
    const sw = switches[0];
    const switchConnections = pairs.filter(
      (p) => p.from.instanceId === sw.instanceId || p.to.instanceId === sw.instanceId
    );
    if (switchConnections.length >= 3) {
      findings.push(makeFinding(
        'single-switch-spoF', 'warning', 'reliability',
        'Single switch dependency',
        `Most of your architecture depends on ${sw.name}. A switch failure could disconnect multiple services.`,
        isAdvanced
          ? 'Consider network redundancy with a secondary switch for high availability.'
          : 'Consider keeping a simple spare switch for quick replacement.',
        {
          detected: `${switchConnections.length} devices are connected through a single switch (${sw.name}).`,
          whyItMatters: 'A single point of failure is a component whose failure could affect several other devices. If this switch fails, all connected devices lose network connectivity.',
          whatYouCanDo: isAdvanced
            ? 'Design network redundancy with multiple switches and link aggregation.'
            : 'Keep a spare switch on hand, or distribute critical connections across multiple switches.',
        },
        sw.instanceId
      ));
    }
  }

  const computeNodes = componentRoles.filter((r) => r.role === 'compute').map((r) => r.component);
  if (computeNodes.length === 1 && components.length >= 4) {
    findings.push(makeFinding(
      'single-compute', 'info', 'reliability',
      'Single compute node',
      'All services run on one compute device. If it fails, all services become unavailable.',
      'Consider distributing critical services across multiple devices if high availability is important.',
      undefined, undefined
    ));
  }

  return findings;
}

export function analyzeBudget(ctx: {
  metrics: import('@/features/calculations/types').ProjectMetrics | null;
}): Finding[] {
  const findings: Finding[] = [];
  const { metrics } = ctx;
  if (!metrics) return findings;
  const { budget } = metrics;
  if (budget.budget == null) return findings;

  if (budget.isOverBudget) {
    findings.push(makeFinding(
      'over-budget', 'warning', 'budget',
      'Known project cost exceeds your budget',
      `Your known cost is ${formatCost(budget.knownCost, 'USD')} but your budget is ${formatCost(budget.budget, 'USD')}. You are over by ${formatCost(budget.overAmount ?? 0, 'USD')}.`,
      'Review your component choices or adjust your budget.',
      {
        detected: `Known cost: ${formatCost(budget.knownCost, 'USD')}. Budget: ${formatCost(budget.budget, 'USD')}.`,
        whyItMatters: 'The known cost already exceeds the budget. Additional unpriced components may increase the gap.',
        whatYouCanDo: 'Consider lower-cost alternatives, buy used equipment, or increase your budget.',
      }
    ));
  } else if (budget.remaining != null) {
    const ratio = budget.remaining / budget.budget;
    if (ratio < 0.15) {
      findings.push(makeFinding(
        'near-budget', 'warning', 'budget',
        'Your project is approaching its budget limit',
        `Known cost is ${formatCost(budget.knownCost, 'USD')} with ${formatCost(budget.remaining, 'USD')} remaining of your ${formatCost(budget.budget, 'USD')} budget.`,
        'Review remaining purchases carefully.',
        undefined, undefined
      ));
    } else {
      findings.push(makeFinding(
        'within-budget', 'good', 'budget',
        'Your known project cost is within the planned budget',
      `Known cost is ${formatCost(budget.knownCost, 'USD')} with ${formatCost(budget.remaining, 'USD')} remaining.`,
      undefined, undefined
      ));
    }
  }

  if (budget.hasUnpricedItems) {
    findings.push(makeFinding(
      'unpriced-budget', 'info', 'budget',
      `${budget.unpricedCount} component${budget.unpricedCount !== 1 ? 's' : ''} ha${budget.unpricedCount === 1 ? 's' : 've'} no price`,
      'Your architecture may exceed the budget because some components have no price.',
      'Add prices to all components for an accurate budget comparison.',
      undefined, undefined
    ));
  }

  return findings;
}

export function analyzeScalability(ctx: {
  components: ProjectComponent[];
  connections: Connection[];
  componentRoles: { component: ProjectComponent; role: string }[];
}): Finding[] {
  const findings: Finding[] = [];
  const { components, connections, componentRoles } = ctx;

  const switches = componentRoles.filter((r) => r.role === 'switch').map((r) => r.component);
  const pairs = getConnectionPairs(components, connections);

  for (const sw of switches) {
    const portCount = sw.networkPorts ?? 0;
    if (portCount > 0) {
      const usedPorts = pairs.filter(
        (p) => p.from.instanceId === sw.instanceId || p.to.instanceId === sw.instanceId
      ).length;
      const freePorts = portCount - usedPorts;
      if (freePorts > 2) {
        findings.push(makeFinding(
          'switch-expandable', 'good', 'scalability',
          `${sw.name} has expansion capacity`,
          `Approximately ${freePorts} of ${portCount} ports are available for future devices.`,
          undefined, undefined, sw.instanceId
        ));
      } else if (freePorts <= 1 && usedPorts >= 3) {
        findings.push(makeFinding(
          'switch-near-full', 'warning', 'scalability',
          `${sw.name} is running low on available ports`,
          `Approximately ${Math.max(freePorts, 0)} of ${portCount} ports remain available.`,
          'Future network expansion may require additional switching capacity.',
          undefined, sw.instanceId
        ));
      }
    } else {
      findings.push(makeFinding(
        'switch-ports-unknown', 'info', 'scalability',
        `Expansion capacity cannot be determined for ${sw.name}`,
        'Port count is not specified for this switch.',
        undefined, undefined, sw.instanceId
      ));
    }
  }

  const nasDevices = components.filter((c) => c.category === 'storage' && (c.driveBays ?? 0) > 0);
  for (const nas of nasDevices) {
    const driveBays = nas.driveBays ?? 0;
    const drivesInstalled = components.filter(
      (c) => c.category === 'storage' && c.formFactor === 'drive'
    ).length;
    if (driveBays > drivesInstalled) {
      findings.push(makeFinding(
        'storage-expandable', 'good', 'scalability',
        `${nas.name} has unused drive bays`,
        `${driveBays} bays with ${drivesInstalled} drive${drivesInstalled !== 1 ? 's' : ''} detected — storage expansion appears possible.`,
        undefined, undefined, nas.instanceId
      ));
    } else if (driveBays > 0 && drivesInstalled >= driveBays) {
      findings.push(makeFinding(
        'storage-full', 'info', 'scalability',
        `${nas.name} drive bays are all occupied`,
        'Future storage growth may require additional hardware.',
        undefined, undefined, nas.instanceId
      ));
    }
  }

  return findings;
}

export function analyzeDataCompleteness(ctx: {
  metrics: import('@/features/calculations/types').ProjectMetrics | null;
}): Finding[] {
  const findings: Finding[] = [];
  const { metrics } = ctx;
  if (!metrics) return findings;

  if (metrics.cost.unpricedComponentCount > 0) {
    findings.push(makeFinding(
      'missing-price', 'info', 'data-completeness',
      `${metrics.cost.unpricedComponentCount} component${metrics.cost.unpricedComponentCount !== 1 ? 's' : ''} ha${metrics.cost.unpricedComponentCount === 1 ? 's' : 've'} no price`,
      'Add prices for more accurate cost and budget calculations.',
      undefined, undefined
    ));
  }

  if (metrics.power.unknownPowerCount > 0) {
    findings.push(makeFinding(
      'missing-power', 'info', 'data-completeness',
      `${metrics.power.unknownPowerCount} component${metrics.power.unknownPowerCount !== 1 ? 's' : ''} ha${metrics.power.unknownPowerCount === 1 ? 's' : 've'} no power estimate`,
      'Add power values for more accurate energy cost calculations.',
      undefined, undefined
    ));
  }

  if (metrics.network.unknownNetworkCount > 0) {
    findings.push(makeFinding(
      'missing-network', 'info', 'data-completeness',
      `Network capability is unknown for ${metrics.network.unknownNetworkCount} component${metrics.network.unknownNetworkCount !== 1 ? 's' : ''}`,
      'Add network speed values for more accurate network analysis.',
      undefined, undefined
    ));
  }

  return findings;
}
