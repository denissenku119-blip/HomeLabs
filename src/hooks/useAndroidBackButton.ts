import { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/router-compat';
import { isPluginAvailable, isAndroidPlatform, isNativePlatform } from '@/services/platform.service';

/** Maps a child route to its in-app parent. */
export function getParentRoute(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/app') return null;

  const report = path.match(/^\/app\/project\/([^/]+)\/report$/);
  if (report) return `/app/project/${report[1]}`;

  if (/^\/app\/project\/[^/]+$/.test(path)) return '/app/projects';
  if (path === '/app/projects' || path === '/app/new' || path === '/app/settings') return '/app';
  if (path.startsWith('/explore/')) return '/explore';
  if (path === '/feedback') return '/app/settings';
  if (path === '/privacy' || path === '/terms' || path === '/disclaimer') return '/about';

  return '/';
}

function closeTopmostOverlay(): boolean {
  if (typeof document === 'undefined') return false;
  const overlays = document.querySelectorAll<HTMLElement>('[role="dialog"], [data-overlay="true"]');
  const overlay = overlays[overlays.length - 1];
  if (!overlay) return false;

  const closeBtn = overlay.querySelector<HTMLElement>(
    '[data-close-overlay], [aria-label="Close dialog"], [aria-label="Close navigation menu"], [aria-label="Dismiss"], [aria-label="Close"]'
  );
  if (closeBtn) {
    closeBtn.click();
    return true;
  }

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return true;
}

export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAndroidPlatform() || !isNativePlatform() || !isPluginAvailable('App')) return;

    let listener: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        const handle = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          try {
            // 1. An open drawer/modal/sheet closes first.
            if (closeTopmostOverlay()) return;

            // 2. A child screen goes to its logical parent.
            const parent = getParentRoute(location.pathname);
            if (parent) {
              navigate(parent);
              return;
            }

            // 3. Otherwise fall back to history, then exit.
            if (canGoBack) {
              navigate(-1);
              return;
            }
            CapacitorApp.exitApp();
          } catch {
            // Never let the handler throw into the native bridge.
          }
        });

        if (cancelled) handle.remove();
        else listener = handle;
      } catch {
        // App plugin unavailable in this build — system back keeps default behaviour.
      }
    })();

    return () => {
      cancelled = true;
      if (listener) listener.remove();
    };
  }, [navigate, location.pathname]);
}
