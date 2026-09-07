import { type ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

interface TopBarProps {
  projectName?: string;
  children?: ReactNode;
}

export function TopBar({ projectName, children }: TopBarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between h-14 px-4 sm:px-6 bg-base-900 border-b border-base-700 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-md text-base-200 hover:text-base-50 hover:bg-base-800 transition-colors"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {projectName && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-base-50 truncate">
                {projectName}
              </span>
              <span className="hidden sm:inline text-base-400 text-sm">/</span>
              <span className="hidden sm:inline text-sm text-base-300">Draft</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {children}
          {/* Profile placeholder */}
          <div
            className="w-8 h-8 rounded-full bg-base-700 border border-base-600 flex items-center justify-center text-xs font-semibold text-base-200"
            aria-label="Profile"
          >
            <span>HL</span>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-in-right">
            <div className="relative h-full">
              <button
                className="absolute right-3 top-4 z-10 p-1.5 rounded-md text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
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
