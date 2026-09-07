import { NavLink, Link } from 'react-router-dom';
import {
  LayoutGrid,
  FolderKanban,
  Plus,
  Compass,
  Settings,
  HelpCircle,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/app/new', label: 'New Project', icon: Plus },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-base-900 border-r border-base-700 w-60">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 px-5 h-14 border-b border-base-700 flex-shrink-0"
        onClick={onNavigate}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-base-950">
          <Server className="w-4.5 h-4.5" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-bold text-base-50 leading-tight">
          HomeLab
          <br />
          <span className="text-accent">Architect</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-base-200 hover:text-base-50 hover:bg-base-800'
                    )
                  }
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-base-700 flex-shrink-0">
        <NavLink
          to="/about"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
        >
          <HelpCircle className="w-4.5 h-4.5 flex-shrink-0" />
          Help
        </NavLink>
        <div className="px-3 mt-3 text-2xs text-base-400 font-mono">
          v0.1.0-alpha
        </div>
      </div>
    </div>
  );
}
