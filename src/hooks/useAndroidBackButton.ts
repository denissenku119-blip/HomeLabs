import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || !('__ Capacitor' in window)) return;

    let listener: { remove: () => void } | null = null;

    (async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        listener = await CapacitorApp.addListener('backButton', () => {
          const modalOpen = document.querySelector('[role="dialog"]');
          if (modalOpen) {
            const closeBtn = modalOpen.querySelector('[aria-label="Close dialog"], [aria-label="Close navigation menu"], [aria-label="Dismiss"]') as HTMLElement | null;
            if (closeBtn) {
              closeBtn.click();
              return;
            }
          }

          const path = location.pathname;
          if (path === '/' || path === '/app') {
            CapacitorApp.exitApp();
            return;
          }

          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        });
      } catch {
        // Capacitor App plugin not available
      }
    })();

    return () => {
      if (listener) listener.remove();
    };
  }, [navigate, location.pathname]);
}
