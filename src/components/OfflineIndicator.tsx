import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-warning-500 text-base-950 px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You're offline. Your local projects are still available.</span>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Status dot */}
      <span
        className={cn(
          'inline-flex items-center gap-1 text-2xs',
          isOnline ? 'text-base-400' : 'text-warning-400'
        )}
        title={isOnline ? 'Online' : 'Offline'}
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      </span>

      {/* Update notification */}
      {showUpdate && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-4 sm:w-80 z-[60] rounded-lg border border-base-700 bg-base-900 shadow-elevated p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-base-100">New version available</p>
              <p className="text-2xs text-base-400 mt-0.5">Reload to get the latest version.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => setShowUpdate(false)}
              className="text-xs text-base-400 hover:text-base-200 px-2 py-1"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="text-xs font-medium bg-accent text-base-950 rounded-md px-3 py-1.5 hover:bg-accent-400 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </>
  );
}
