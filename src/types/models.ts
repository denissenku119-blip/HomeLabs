export interface User {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: string;
}

export interface UserPreferences {
  language: string;
  defaultCurrency: string;
  defaultVoltage: string;
  electricityRate: string;
}

export interface ProjectOwner {
  userId: string;
  projectId: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface SyncMetadata {
  version: number;
  syncStatus: 'local' | 'pending' | 'synced' | 'conflict';
  lastSyncedAt?: string;
  remoteId?: string;
  remoteVersion?: number;
}
