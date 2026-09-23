import { type ReactNode, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useI18n } from '@/i18n/I18nContext';

interface TopBarProps {
  projectName?: string;
  children?: ReactNode;
  sticky?: boolean;
}

export function TopBar({ projectName, children, sticky = false }: TopBarProps) {
  const { t } = useI18n();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <>
      <header
        className={
          'flex items-center justify-between h-14 px-4 sm:px-6 bg-base-900 border-b border-base-700 flex-shrink-0 z-30 safe-top' +
          (sticky ? ' sticky top-0' : '')
        }
      >
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-md text-base-200 hover:text-base-50 hover:bg-base-800 transition-colors"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t('navigation.openMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>

          {projectName && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-base-50 truncate">
                {projectName}
              </span>
              <span className="hidden sm:inline text-base-400 text-sm">/</span>
              <span className="hidden sm:inline text-sm text-base-300">{t('common.draft')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {children}
          {/* Profile placeholder */}
          <div
            className="w-8 h-8 rounded-full bg-base-700 border border-base-600 flex items-center justify-center text-xs font-semibold text-base-200"
            aria-label={t('navigation.profile')}
          >
            <span>HL</span>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 h-[100dvh] overflow-hidden lg:hidden"
          data-overlay="true"
          role="dialog"
          aria-modal="true"
          aria-label={t('navigation.openMenu')}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="touch-scroll-y absolute inset-y-0 start-0 w-60 max-w-[calc(100vw-2rem)] animate-slide-in-right bg-base-900 safe-bottom">
            <div className="relative h-full min-h-0">
              <button
                className="absolute right-3 top-4 z-10 p-1.5 rounded-md text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
                onClick={() => setMobileNavOpen(false)}
                aria-label={t('navigation.closeMenu')}
                data-close-overlay
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
