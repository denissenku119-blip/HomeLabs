import { NavLink, Link } from '@/lib/router-compat';
import {
  LayoutGrid,
  FolderKanban,
  Plus,
  Compass,
  Settings,
  HelpCircle,
  Compass as CompassIcon,
  Crown,
  Server,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { openGuide } from '@/features/guide/guideStore';
import { usePlan } from '@/features/entitlements/plan';
import { UpgradeModal } from '@/components/pro/UpgradePanel';
import { useState } from 'react';

const navItems = [
  { to: '/app', key: 'navigation.overview', icon: LayoutGrid, end: true },
  { to: '/app/projects', key: 'navigation.myProjects', icon: FolderKanban },
  { to: '/app/new', key: 'navigation.newProject', icon: Plus },
  { to: '/explore', key: 'navigation.explore', icon: Compass },
  { to: '/app/settings', key: 'navigation.settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useI18n();
  const { isPro } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 w-60 max-w-full flex-col bg-base-900 border-r border-base-700">
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
      <nav className="touch-scroll-y min-h-0 flex-1 px-3 py-4">
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
                  {t(item.key)}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-base-700 flex-shrink-0">
        {!isPro && (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-sm font-medium rounded-lg text-accent bg-accent/10 hover:bg-accent/15 transition-colors"
          >
            <Crown className="w-4.5 h-4.5 flex-shrink-0" />
            {t('navigation.upgrade')}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            openGuide();
            onNavigate?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
        >
          <CompassIcon className="w-4.5 h-4.5 flex-shrink-0" />
          {t('navigation.quickGuide')}
        </button>
        <NavLink
          to="/feedback"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
        >
          <MessageSquare className="w-4.5 h-4.5 flex-shrink-0" />
          {t('navigation.feedback')}
        </NavLink>
        <NavLink
          to="/about"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-base-300 hover:text-base-50 hover:bg-base-800 transition-colors"
        >
          <HelpCircle className="w-4.5 h-4.5 flex-shrink-0" />
          {t('navigation.help')}
        </NavLink>
        <div className="px-3 mt-3 flex items-center gap-2 text-2xs text-base-400 font-mono">
          <OfflineIndicator />
          <span className="ml-auto uppercase tracking-wide">{isPro ? t('common.pro') : t('common.free')}</span>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
