/**
 * Free vs Pro entitlement model.
 *
 * Pro is a ONE-TIME lifetime purchase. There is no recurring billing anywhere
 * in the app.
 *
 * A valid Google Play purchase of the lifetime Pro product is the ONLY thing
 * that can unlock Pro (see ./billing.ts). The local value below is nothing but
 * a cache of the last verified entitlement — it is written only after billing
 * confirms ownership, and is cleared whenever billing reports no purchase.
 */
import { useCallback, useEffect, useState } from 'react';
import { queryProEntitlement, type EntitlementResult } from './billing';

export type Plan = 'free' | 'pro';

export const PRO_PRICE_USD = 29.99;
export const PRO_PRICE_LABEL = '$29.99';
export const FREE_PROJECT_LIMIT = 1;
export const FREE_CUSTOM_HARDWARE_LIMIT = 2;

/**
 * Curated starter library available on Free: one of each part needed for a
 * realistic beginner homelab (router → switch → server / NAS / access point,
 * plus a drive and a UPS).
 */
export const STARTER_HARDWARE_IDS: string[] = [
  'hw-basic-router',
  'hw-managed-switch-1g',
  'hw-mini-pc',
  'hw-4bay-nas',
  'hw-nas-hdd-4tb',
  'hw-small-ups',
  'hw-wifi-ap',
];

export const PRO_BENEFITS: string[] = [
  'Unlimited saved projects',
  'Full hardware library',
  'Unlimited custom hardware components',
  'Full builder capability',
  'Full calculations',
  'Full reporting capability',
  'Complete app experience',
];

export const FREE_BENEFITS: string[] = [
  '1 saved project',
  'Curated starter hardware library',
  'Connections and full builder trial',
  'Basic calculations',
  'Report access',
  'Up to 2 custom hardware components',
];

const PLAN_KEY = 'homelab-architect:plan';
const PLAN_EVENT = 'homelab-architect:plan-changed';

export function getPlan(): Plan {
  try {
    return localStorage.getItem(PLAN_KEY) === 'pro' ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}

/**
 * Internal. Only called with the result of a Google Play entitlement check —
 * never from UI, never from a referral, share or project value.
 */
function cacheVerifiedPlan(plan: Plan): void {
  try {
    if (plan === 'pro') localStorage.setItem(PLAN_KEY, 'pro');
    else localStorage.removeItem(PLAN_KEY);
  } catch {
    // storage may be unavailable; the in-memory event still updates the UI
  }
  try {
    window.dispatchEvent(new CustomEvent(PLAN_EVENT));
  } catch {
    // non-browser environment
  }
}

/**
 * Re-checks Google Play for the lifetime Pro purchase and syncs the cache.
 * With no billing client present this always resolves to Free.
 */
export async function refreshEntitlement(): Promise<EntitlementResult> {
  const result = await queryProEntitlement();
  if (result.billingAvailable) cacheVerifiedPlan(result.entitled ? 'pro' : 'free');
  return result;
}

export function isStarterHardware(hardwareId: string): boolean {
  return STARTER_HARDWARE_IDS.includes(hardwareId);
}

export function usePlan() {
  const [plan, setPlanState] = useState<Plan>('free');

  useEffect(() => {
    const sync = () => setPlanState(getPlan());
    sync();
    window.addEventListener(PLAN_EVENT, sync);
    window.addEventListener('storage', sync);
    // Re-verify against Google Play on mount so a refunded or missing
    // purchase can never keep Pro alive locally.
    void refreshEntitlement();
    return () => {
      window.removeEventListener(PLAN_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const restorePurchase = useCallback(() => refreshEntitlement(), []);

  return { plan, isPro: plan === 'pro', restorePurchase };
}
