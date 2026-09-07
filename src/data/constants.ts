import type {
  ComponentCategory,
  ConnectionType,
  Currency,
  ExperienceLevel,
  PrimaryGoal,
} from '@/types';
import {
  Cpu,
  HardDrive,
  Network,
  Zap,
  Server,
  Shield,
  Box,
  Cable,
  Wifi,
  HardDriveDownload,
  Plug,
  Link2,
} from 'lucide-react';

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  compute: 'Compute',
  storage: 'Storage',
  networking: 'Networking',
  power: 'Power',
  virtualization: 'Virtualization',
  security: 'Security',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<ComponentCategory, React.ElementType> = {
  compute: Cpu,
  storage: HardDrive,
  networking: Network,
  power: Zap,
  virtualization: Server,
  security: Shield,
  other: Box,
};

export const CATEGORY_ORDER: ComponentCategory[] = [
  'compute',
  'storage',
  'networking',
  'power',
  'virtualization',
  'security',
  'other',
];

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  ethernet: 'Ethernet',
  wifi: 'Wi-Fi',
  storage: 'Storage',
  power: 'Power',
  other: 'Other',
};

export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  ethernet: '#34d399',
  wifi: '#60a5fa',
  storage: '#fbbf24',
  power: '#f87171',
  other: '#9aa3b2',
};

export const CONNECTION_TYPE_ICONS: Record<ConnectionType, React.ElementType> = {
  ethernet: Cable,
  wifi: Wifi,
  storage: HardDriveDownload,
  power: Plug,
  other: Link2,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const GOAL_LABELS: Record<PrimaryGoal, string> = {
  'self-hosting': 'Self-hosting',
  'storage-nas': 'Storage / NAS',
  'virtualization': 'Virtualization',
  'networking': 'Networking',
  'media-server': 'Media server',
  'cybersecurity-lab': 'Cybersecurity lab',
  'development': 'Development',
  'learning': 'Learning',
  'other': 'Other',
};

export const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const STORAGE_KEY_PREFIX = 'homelab-architect:project:';
