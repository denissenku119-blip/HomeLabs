/**
 * Tiny store for the optional first-time guide. Kept outside React so any
 * screen (sidebar, settings) can open the guide without prop drilling.
 */
import { useEffect, useState } from 'react';

const SEEN_KEY = 'homelab-architect:guide-seen';
const GUIDE_EVENT = 'homelab-architect:guide-open';

export function hasSeenGuide(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === 'true';
  } catch {
    return true; // never nag when storage is unavailable
  }
}

export function markGuideSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, 'true');
  } catch {
    // fail silently
  }
}

export function openGuide(): void {
  try {
    window.dispatchEvent(new CustomEvent(GUIDE_EVENT));
  } catch {
    // non-browser environment
  }
}

/** Subscribes to manual "open guide" requests. */
export function useGuideOpenRequests(onOpen: () => void): void {
  const [handler] = useState(() => ({ current: onOpen }));
  handler.current = onOpen;

  useEffect(() => {
    const listener = () => handler.current();
    window.addEventListener(GUIDE_EVENT, listener);
    return () => window.removeEventListener(GUIDE_EVENT, listener);
  }, [handler]);
}
