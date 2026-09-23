/**
 * Google Play Install Referrer capture.
 *
 * Read once per install, entirely optional, and never allowed to affect app
 * behaviour. No personal information is collected — only the campaign
 * parameters that were attached to the shared Play Store link.
 *
 * On Android the value comes from the official Install Referrer API, exposed
 * through the Capacitor bridge when that plugin is present in the native
 * build. On the web the same parameters are read from the launch URL.
 */
import { APP_VERSION } from '@/config/app';
import { getPlatform } from '@/services/platform.service';
import { supabase } from '@/integrations/supabase/client';

const CAPTURED_KEY = 'homelab-architect:install-referrer-captured';

interface ReferrerFields {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  raw_referrer: string;
}

function parseReferrer(raw: string): ReferrerFields | null {
  const value = raw.trim().slice(0, 512);
  if (!value) return null;
  const params = new URLSearchParams(value);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    raw_referrer: value,
  };
}

/** Reads the native Install Referrer plugin if the native build ships one. */
async function readNativeReferrer(): Promise<string | null> {
  try {
    const plugins = (
      window as unknown as {
        Capacitor?: { Plugins?: Record<string, { getReferrerDetails?: () => Promise<unknown> }> };
      }
    ).Capacitor?.Plugins;
    const plugin = plugins?.['InstallReferrer'];
    if (!plugin || typeof plugin.getReferrerDetails !== 'function') return null;
    const details = (await plugin.getReferrerDetails()) as
      | { installReferrer?: string; referrer?: string }
      | undefined;
    return details?.installReferrer ?? details?.referrer ?? null;
  } catch {
    return null;
  }
}

function readWebReferrer(): string | null {
  try {
    const search = window.location.search.replace(/^\?/, '');
    if (!search) return null;
    const params = new URLSearchParams(search);
    if (!params.get('utm_source') && !params.get('referrer')) return null;
    return params.get('referrer') ?? search;
  } catch {
    return null;
  }
}

export async function captureInstallReferrer(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    if (localStorage.getItem(CAPTURED_KEY) === 'true') return;
  } catch {
    // storage blocked — attempt once and stop on failure below
  }

  const raw = (await readNativeReferrer()) ?? readWebReferrer();
  if (!raw) return;

  const fields = parseReferrer(raw);
  if (!fields) return;

  try {
    const { error } = await supabase.from('install_referrals').insert({
      ...fields,
      platform: getPlatform(),
      app_version: APP_VERSION,
    });
    if (error) return; // try again next launch; never surfaced to the user
  } catch {
    return;
  }

  try {
    localStorage.setItem(CAPTURED_KEY, 'true');
  } catch {
    // nothing to do
  }
}
