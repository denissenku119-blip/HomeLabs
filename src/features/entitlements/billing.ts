/**
 * Pro entitlement source of truth — Google Play Billing.
 *
 * Pro is unlocked ONLY by a Google Play purchase of the one-time product below.
 * Nothing else — shared links, referrals, UTM parameters, project data or
 * hand-written storage values — may grant it.
 *
 * SECURITY NOTE: ownership is currently checked on-device only (the native
 * GooglePlayBilling plugin asks the Play Store). This is not tamper-proof.
 * Production-grade verification requires a server that validates the
 * purchase token with the Google Play Developer API.
 */
import { registerPlugin } from '@capacitor/core';
import { isNativePlatform, isPluginAvailable } from '@/services/platform.service';

/** Google Play one-time in-app product (not a subscription). */
export const PRO_PRODUCT_ID = 'homelab_premium';

export type BillingErrorCode =
  | 'BILLING_UNAVAILABLE'
  | 'PRODUCT_NOT_FOUND'
  | 'USER_CANCELED'
  | 'PURCHASE_FAILED'
  | 'PENDING'
  | 'ALREADY_OWNED'
  | 'NETWORK_ERROR';

export interface EntitlementResult {
  /** True only when Google Play reports an owned, completed Pro purchase. */
  entitled: boolean;
  /** False when no billing client is present in this build/runtime. */
  billingAvailable: boolean;
  /** Set when a purchase/restore did not unlock Pro. */
  error?: BillingErrorCode;
}

export interface ProProductDetails {
  productId: string;
  title: string;
  description: string;
  /** Localized price string exactly as returned by Google Play. */
  formattedPrice: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

interface NativePurchase {
  products: string[];
  state: 'PURCHASED' | 'PENDING' | 'UNSPECIFIED';
  acknowledged: boolean;
  purchaseToken: string;
  orderId?: string;
  purchaseTime: number;
}

interface GooglePlayBillingPlugin {
  isReady(): Promise<{ ready: boolean }>;
  getProduct(options: { productId: string }): Promise<ProProductDetails>;
  purchase(options: { productId: string }): Promise<NativePurchase>;
  getPurchases(): Promise<{ purchases: NativePurchase[] }>;
}

const GooglePlayBilling = registerPlugin<GooglePlayBillingPlugin>('GooglePlayBilling');

const KNOWN_CODES: BillingErrorCode[] = [
  'BILLING_UNAVAILABLE',
  'PRODUCT_NOT_FOUND',
  'USER_CANCELED',
  'PURCHASE_FAILED',
  'PENDING',
  'ALREADY_OWNED',
  'NETWORK_ERROR',
];

function toErrorCode(error: unknown): BillingErrorCode {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && (KNOWN_CODES as string[]).includes(code)
    ? (code as BillingErrorCode)
    : 'PURCHASE_FAILED';
}

export function isBillingAvailable(): boolean {
  return isNativePlatform() && isPluginAvailable('GooglePlayBilling');
}

/** Localized product details from Google Play. Never a hard-coded price. */
export async function getProProductDetails(): Promise<ProProductDetails | null> {
  if (!isBillingAvailable()) return null;
  try {
    return await GooglePlayBilling.getProduct({ productId: PRO_PRODUCT_ID });
  } catch {
    return null;
  }
}

/** Ask Google Play whether this account owns the Pro product (restore path). */
export async function queryProEntitlement(): Promise<EntitlementResult> {
  if (!isBillingAvailable()) return { entitled: false, billingAvailable: false };
  try {
    const { purchases } = await GooglePlayBilling.getPurchases();
    const mine = (purchases ?? []).filter((p) => p.products?.includes(PRO_PRODUCT_ID));
    if (mine.some((p) => p.state === 'PURCHASED')) return { entitled: true, billingAvailable: true };
    if (mine.some((p) => p.state === 'PENDING'))
      return { entitled: false, billingAvailable: true, error: 'PENDING' };
    return { entitled: false, billingAvailable: true };
  } catch (error) {
    const code = toErrorCode(error);
    return { entitled: false, billingAvailable: code !== 'BILLING_UNAVAILABLE', error: code };
  }
}

/** Launch the Google Play purchase flow for the one-time Pro product. */
export async function purchasePro(): Promise<EntitlementResult> {
  if (!isBillingAvailable())
    return { entitled: false, billingAvailable: false, error: 'BILLING_UNAVAILABLE' };
  try {
    const purchase = await GooglePlayBilling.purchase({ productId: PRO_PRODUCT_ID });
    if (purchase.state === 'PENDING')
      return { entitled: false, billingAvailable: true, error: 'PENDING' };
    return queryProEntitlement();
  } catch (error) {
    const code = toErrorCode(error);
    // Already owned: re-sync from Google Play so the owner gets Pro back.
    if (code === 'ALREADY_OWNED') {
      const restored = await queryProEntitlement();
      return { ...restored, error: restored.entitled ? undefined : 'ALREADY_OWNED' };
    }
    return { entitled: false, billingAvailable: code !== 'BILLING_UNAVAILABLE', error: code };
  }
}
