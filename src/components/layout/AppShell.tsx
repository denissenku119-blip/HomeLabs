import { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { FirstTimeGuide } from '@/features/guide/FirstTimeGuide';
import { cn } from '@/lib/utils';

interface AppShellProps {
  projectName?: string;
  children: ReactNode;
  topBarActions?: ReactNode;
  /**
   * Locks the shell to the viewport height (used by the canvas workspace).
   * Normal pages scroll with the document instead.
   */
  fullHeight?: boolean;
}

export function AppShell({ projectName, children, topBarActions, fullHeight = false }: AppShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-[100dvh] bg-base-950',
        fullHeight && 'lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden'
      )}
    >
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 lg:sticky lg:top-0 lg:h-[100dvh]">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar projectName={projectName} sticky={!fullHeight}>
          {topBarActions}
        </TopBar>
        <main
          className={cn(
            'flex-1 min-h-0',
            fullHeight
              ? 'overflow-visible lg:touch-scroll-y'
              : 'safe-bottom'
          )}
        >
          {children}
        </main>
      </div>

      <FirstTimeGuide />
    </div>

  );
}
