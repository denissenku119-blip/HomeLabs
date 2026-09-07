import { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

interface AppShellProps {
  projectName?: string;
  children: ReactNode;
  topBarActions?: ReactNode;
}

export function AppShell({ projectName, children, topBarActions }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-base-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar projectName={projectName}>{topBarActions}</TopBar>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
