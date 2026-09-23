/**
 * Pro entitlement source of truth.
 *
 * Pro is unlocked ONLY by a valid Google Play purchase of the one-time
 * lifetime product below. Nothing else — no shared link, referral, UTM
 * parameter, project data or hand-written storage value — may grant it.
 *
 * Google Play Billing is not connected in this build. Until it is, this module
 * always reports "no entitlement, billing unavailable", and the rest of the app
 * treats that as Free. When billing is added, only `queryProEntitlement` and
 * `purchasePro` need a real implementation.
 */
import { isNativePlatform } from '@/services/platform.service';

/** Google Play in-app product for the $29.99 one-time lifetime unlock. */
export const PRO_PRODUCT_ID = 'homelab_architect_pro_lifetime';

export interface EntitlementResult {
  /** True only when Google Play confirms an owned, valid Pro purchase. */
  entitled: boolean;
  /** False when no billing client is present in this build/runtime. */
  billingAvailable: boolean;
}

interface BillingBridge {
  getPurchases?: () => Promise<{ purchases?: { productId?: string }[] } | undefined>;
  purchase?: (options: { productId: string }) => Promise<{ purchased?: boolean } | undefined>;
}

function getBillingBridge(): BillingBridge | null {
  try {
    if (!isNativePlatform()) return null;
    const plugins = (
      window as unknown as { Capacitor?: { Plugins?: Record<string, BillingBridge> } }
    ).Capacitor?.Plugins;
    const bridge = plugins?.['GooglePlayBilling'];
    return bridge && typeof bridge === 'object' ? bridge : null;
  } catch {
    return null;
  }
}

export function isBillingAvailable(): boolean {
  const bridge = getBillingBridge();
  return !!bridge && typeof bridge.getPurchases === 'function';
}

/** Ask Google Play whether this account owns the lifetime Pro product. */
export async function queryProEntitlement(): Promise<EntitlementResult> {
  const bridge = getBillingBridge();
  if (!bridge || typeof bridge.getPurchases !== 'function') {
    return { entitled: false, billingAvailable: false };
  }
  try {
    const result = await bridge.getPurchases();
    const owned = (result?.purchases ?? []).some((p) => p.productId === PRO_PRODUCT_ID);
    return { entitled: owned, billingAvailable: true };
  } catch {
    return { entitled: false, billingAvailable: true };
  }
}

/** Entry point a future Google Play Billing integration plugs into. */
export async function purchasePro(): Promise<EntitlementResult> {
  const bridge = getBillingBridge();
  if (!bridge || typeof bridge.purchase !== 'function') {
    return { entitled: false, billingAvailable: false };
  }
  try {
    await bridge.purchase({ productId: PRO_PRODUCT_ID });
  } catch {
    return { entitled: false, billingAvailable: true };
  }
  return queryProEntitlement();
}
