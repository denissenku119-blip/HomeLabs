/**
 * Tiny module-level store so the workspace top bar can show the autosave
 * state without threading props through the whole builder tree.
 */
import { useEffect, useState } from 'react';

export type SaveStatus = 'saved' | 'saving';

let current: SaveStatus = 'saved';
const listeners = new Set<(status: SaveStatus) => void>();

export function setSaveStatus(status: SaveStatus): void {
  if (current === status) return;
  current = status;
  listeners.forEach((listener) => listener(status));
}

export function getSaveStatus(): SaveStatus {
  return current;
}

export function useSaveStatus(): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>(current);
  useEffect(() => {
    setStatus(current);
    listeners.add(setStatus);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);
  return status;
}
