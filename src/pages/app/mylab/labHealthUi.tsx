import { useMemo, useState } from 'react';
import { ChevronDown, Crosshair } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/I18nContext';
import { loadMyLab } from '@/features/mylab/myLabStore';
import { computeLabHealth, type AreaStatus, type CheckLevel, type LabCheck } from '@/features/mylab/labHealth';

/** Reads the saved My Lab and derives health on every visit (always current). */
export function useLabHealth() {
  const { t } = useI18n();
  const lab = useMemo(() => loadMyLab(), []);
  const health = useMemo(
    () => (lab && lab.components.length > 0 ? computeLabHealth(lab, t) : null),
    [lab, t],
  );
  return { lab, health };
}

const LEVEL_VARIANT: Record<CheckLevel, 'warning' | 'info' | 'default' | 'success'> = {
  attention: 'warning',
  check: 'info',
  info: 'default',
  ok: 'success',
};

export function LevelBadge({ level }: { level: CheckLevel }) {
  const { t } = useI18n();
  return <Badge variant={LEVEL_VARIANT[level]} dot>{t(`labhealth.level.${level}`)}</Badge>;
}

const STATUS_VARIANT: Record<AreaStatus, 'warning' | 'info' | 'default' | 'success'> = {
  attention: 'warning',
  check: 'info',
  ok: 'success',
  unknown: 'default',
};

export function StatusBadge({ status }: { status: AreaStatus }) {
  const { t } = useI18n();
  return <Badge variant={STATUS_VARIANT[status]} dot>{t(`labhealth.status.${status}`)}</Badge>;
}

export function CheckItem({ check, names }: { check: LabCheck; names: Map<string, string> }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const hasMore = !!(check.why || check.action || check.componentIds.length);
  return (
    <li className="rounded-lg border border-base-700 bg-base-850">
      <button
        type="button"
        onClick={() => hasMore && setOpen((o) => !o)}
        aria-expanded={hasMore ? open : undefined}
        className="w-full min-h-[44px] flex items-start gap-3 p-3 text-start"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={check.level} />
          </div>
          <p className="mt-1.5 text-sm font-medium text-base-50 break-words">{check.title}</p>
          {!open && <p className="mt-1 text-xs text-base-300 break-words line-clamp-2">{check.what}</p>}
        </div>
        {hasMore && (
          <ChevronDown className={`w-4 h-4 mt-1 flex-shrink-0 text-base-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 text-sm">
          <div>
            <p className="text-2xs uppercase tracking-wide text-base-400">{t('labhealth.what')}</p>
            <p className="mt-0.5 text-base-200 break-words">{check.what}</p>
          </div>
          {check.why && (
            <div>
              <p className="text-2xs uppercase tracking-wide text-base-400">{t('labhealth.why')}</p>
              <p className="mt-0.5 text-base-200 break-words">{check.why}</p>
            </div>
          )}
          {check.action && (
            <div>
              <p className="text-2xs uppercase tracking-wide text-base-400">{t('labhealth.action')}</p>
              <p className="mt-0.5 text-base-200 break-words">{check.action}</p>
            </div>
          )}
          {check.componentIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {check.componentIds.map((id) => (
                <Link
                  key={id}
                  to="/app/my-lab/topology"
                  {...({ search: { focus: id } } as Record<string, unknown>)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-base-600 px-2.5 text-xs font-medium text-accent"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {t('labhealth.showOnTopology', { name: names.get(id) ?? '' })}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
