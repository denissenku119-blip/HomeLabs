import { useEffect, useRef } from 'react';

export function useAppLifecycle(onSuspend: () => void) {
  const callbackRef = useRef(onSuspend);
  callbackRef.current = onSuspend;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        callbackRef.current();
      }
    };

    const handlePageHide = () => {
      callbackRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);
}
