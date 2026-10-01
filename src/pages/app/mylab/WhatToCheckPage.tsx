import { useMemo, useState } from 'react';
import { ChevronDown, ListChecks } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nContext';
import { HEALTH_AREAS, type HealthArea } from '@/features/mylab/labHealth';
import { CheckItem, StatusBadge, useLabHealth } from './labHealthUi';

export function WhatToCheckPage() {
  const { t } = useI18n();
  const { lab, health } = useLabHealth();
  const names = useMemo(() => new Map((lab?.components ?? []).map((c) => [c.instanceId, c.name])), [lab]);
  const [collapsed, setCollapsed] = useState<Set<HealthArea>>(new Set());
  const toggle = (a: HealthArea) =>
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(a)) n.delete(a);
      else n.add(a);
      return n;
    });

  // What to Check lists only things to investigate (strengths live in Lab Health).
  const actionable = health ? health.checks.filter((c) => c.level !== 'ok') : [];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <BackButton to="/app/my-lab" label={t('mylab.title')} />
        <h1 className="mt-3 text-2xl font-bold text-base-50">{t('labhealth.checks.title')}</h1>
        <p className="mt-1 text-sm text-base-300">{t('labhealth.checks.tagline')}</p>
        <p className="mt-1 text-xs text-base-400">{t('labhealth.modelNote')}</p>

        {!health ? (
          <Card className="mt-6">
            <EmptyState
              icon={<ListChecks className="w-8 h-8" />}
              title={t('mylab.empty.title')}
              description={t('mylab.empty.description')}
              action={<Link to="/app/my-lab/setup"><Button>{t('mylab.setup.cta')}</Button></Link>}
            />
          </Card>
        ) : actionable.length === 0 ? (
          <Card className="mt-6 p-5 text-sm text-base-200">{t('labhealth.checks.none')}</Card>
        ) : (
          <div className="mt-6 space-y-4">
            {HEALTH_AREAS.map((area) => {
              const items = actionable.filter((c) => c.area === area);
              if (!items.length) return null;
              const isCollapsed = collapsed.has(area);
              return (
                <section key={area} id={area}>
                  <button
                    type="button"
                    onClick={() => toggle(area)}
                    aria-expanded={!isCollapsed}
                    className="w-full min-h-[44px] flex items-center justify-between gap-3 text-start"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base font-semibold text-base-50">{t(`labhealth.area.${area}`)}</span>
                      <span className="text-xs text-base-400">({items.length})</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={health.areaStatus[area]} />
                      <ChevronDown className={`w-4 h-4 text-base-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </span>
                  </button>
                  {!isCollapsed && (
                    <ul className="mt-2 space-y-2">
                      {items.map((c) => <CheckItem key={c.id} check={c} names={names} />)}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
