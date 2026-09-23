/**
 * Sharing the app itself.
 *
 * The store link is built from the configured Android package ID so it can
 * never drift from the real listing, and carries the campaign parameters used
 * to identify traffic that came from in-app sharing.
 */
import { APP_IDENTIFIER } from '@/config/app';
import { shareContent, type ShareResult } from '@/services/share.service';

export const PLAY_REFERRAL_PARAMS = {
  utm_source: 'app_share',
  utm_medium: 'referral',
  utm_campaign: 'homelab_share',
} as const;

/** `referrer` is what Google Play hands back through the Install Referrer API. */
function buildPlayStoreUrl(): string {
  const referrer = new URLSearchParams(PLAY_REFERRAL_PARAMS).toString();
  const params = new URLSearchParams({
    id: APP_IDENTIFIER,
    ...PLAY_REFERRAL_PARAMS,
    referrer,
  });
  return `https://play.google.com/store/apps/details?${params.toString()}`;
}

export const PLAY_STORE_URL = buildPlayStoreUrl();

export const SHARE_TITLE = 'HomeLab Architect';
export const SHARE_TEXT =
  'Design your homelab before you buy it with HomeLab Architect. Build, connect, calculate and visualize your setup.';

export async function shareApp(): Promise<ShareResult> {
  return shareContent({
    title: SHARE_TITLE,
    text: SHARE_TEXT,
    url: PLAY_STORE_URL,
  });
}
