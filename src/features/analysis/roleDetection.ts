import type { ProjectComponent } from '@/types';
import type { ComponentRole } from './types';

function detectRole(comp: ProjectComponent): ComponentRole {
  const name = comp.name.toLowerCase();
  const sub = comp.subcategory?.toLowerCase() ?? '';
  const cat = comp.category;
  const useCases = comp.useCases.map((u) => u.toLowerCase());
  const useCaseText = useCases.join(' ');

  if (cat === 'power' || sub === 'ups' || sub === 'pdu') return 'power-protection';
  if (cat === 'networking' || cat === 'security') {
    if (sub.includes('router') || name.includes('router')) return 'router';
    if (sub.includes('firewall') || name.includes('firewall') || name.includes('pfsense') || name.includes('opnsense')) return 'firewall';
    if (sub.includes('access point') || sub.includes('wi-fi') || name.includes('access point')) return 'access-point';
    if (sub.includes('switch') || name.includes('switch')) return 'switch';
    return cat === 'security' ? 'firewall' : 'other';
  }
  if (cat === 'storage') {
    if (sub.includes('external') || name.includes('backup') || name.includes('usb') || useCaseText.includes('backup')) return 'backup';
    return 'storage';
  }
  if (cat === 'compute' || cat === 'virtualization') return 'compute';
  if (cat === 'other') {
    if (name.includes('backup') || useCaseText.includes('backup')) return 'backup';
  }
  return 'other';
}

export function detectComponentRoles(components: ProjectComponent[]): {
  roles: Map<string, ComponentRole>;
  componentRoles: { component: ProjectComponent; role: ComponentRole }[];
} {
  const roles = new Map<string, ComponentRole>();
  const componentRoles = components.map((comp) => {
    const role = detectRole(comp);
    roles.set(comp.instanceId, role);
    return { component: comp, role };
  });
  return { roles, componentRoles };
}
