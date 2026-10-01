import { useMemo, useState } from 'react';
import { FlaskConical, Check, Trash2, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { BuilderWorkspace } from '@/features/builder/BuilderWorkspace';
import { Link, useNavigate } from '@/lib/router-compat';
import { useI18n } from '@/i18n/I18nContext';
import { loadMyLab } from '@/features/mylab/myLabStore';
import { computeLabHealth, HEALTH_AREAS, type LabHealth } from '@/features/mylab/labHealth';
import {
  PROPOSAL_ID, applyProposal, diffIsEmpty, diffLabs, discardProposal, loadProposal, proposalStorage, summarizeLab,
  type LabDiff, type LabSummary,
} from '@/features/mylab/proposalStore';
import { formatCost, formatNetwork, formatPower, formatStorage } from '@/utils/calculations';
import { StatusBadge } from '@/pages/app/mylab/labHealthUi';
import { CHANGE_ICONS } from '@/pages/app/mylab/PlanChangePage';

type View = 'current' | 'proposed' | 'compare';

function describe(diff: LabDiff, t: (k: string, p?: Record<string, string | number>) => string): string[] {
  const out: string[] = [];
  diff.added.forEach((c) => out.push(t('proposal.adding', { name: c.name })));
  diff.removed.forEach((c) => out.push(t('proposal.removing', { name: c.name })));
  diff.changed.forEach(({ before, after }) =>
    out.push(before.name === after.name ? t('proposal.updating', { name: after.name }) : t('proposal.replacing', { from: before.name, to: after.name })),
  );
  if (diff.connectionsAdded) out.push(t('proposal.connAdded', { count: diff.connectionsAdded }));
  if (diff.connectionsRemoved) out.push(t('proposal.connRemoved', { count: diff.connectionsRemoved }));
  if (diff.connectionsChanged) out.push(t('proposal.connChanged', { count: diff.connectionsChanged }));
  return out;
}

export function ProposalPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('proposed');
  const [confirm, setConfirm] = useState<'apply' | 'discard' | null>(null);
  // Re-read from storage whenever the view changes (builder flushes on unmount).
  const current = useMemo(() => loadMyLab(), []);
  const proposal = useMemo(() => loadProposal(), [view, confirm]);

  if (!current || !proposal) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <BackButton to="/app/my-lab" label={t('mylab.title')} />
          <Card className="mt-6">
            <EmptyState
              icon={<FlaskConical className="w-8 h-8" />}
              title={t('proposal.none')}
              description={t('plan.tagline')}
              action={<Link to="/app/my-lab/plan"><Button>{t('plan.title')}</Button></Link>}
            />
          </Card>
        </div>
      </AppShell>
    );
  }

  const diff = diffLabs(current, proposal.lab);
  const lines = describe(diff, t);
  const Icon = CHANGE_ICONS[proposal.changeType];

  const onApply = () => {
    const desc = lines.length ? lines.join('; ') : t(`plan.type.${proposal.changeType}`);
    const affected = [...diff.added, ...diff.removed, ...diff.changed.map((c) => c.after)].map((c) => c.name);
    if (applyProposal(desc, affected)) navigate('/app/my-lab');
  };
  const onDiscard = () => {
    discardProposal();
    navigate('/app/my-lab');
  };

  return (
    <AppShell fullHeight={view === 'proposed'}>
      <div className={view === 'proposed' ? 'flex min-h-[calc(100dvh-3.5rem)] flex-col lg:h-full lg:min-h-0' : ''}>
        <div className="px-4 sm:px-6 py-3 border-b border-base-700 bg-base-900 flex-shrink-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <BackButton to="/app/my-lab" label={t('mylab.title')} />
            <Badge variant="warning" dot>{t('proposal.simulation')}</Badge>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-lg font-bold text-base-50">
                <Icon className="w-5 h-5 text-accent" /> {t('proposal.title')}
              </h1>
              <p className="text-xs text-base-300">{t('proposal.notChanged')}</p>
              <p className="mt-1 text-sm text-base-100 break-words">
                {lines.length ? lines.slice(0, 3).join(' · ') + (lines.length > 3 ? ` · +${lines.length - 3}` : '') : t(`plan.hint.${proposal.changeType}`)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => (diffIsEmpty(diff) ? onDiscard() : setConfirm('discard'))}>
                {t('proposal.discard')}
              </Button>
              <Button leftIcon={<Check className="w-4 h-4" />} disabled={diffIsEmpty(diff)} onClick={() => setConfirm('apply')}>
                {t('proposal.apply')}
              </Button>
            </div>
          </div>
          <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-base-850 border border-base-700 max-w-md">
            {(['current', 'proposed', 'compare'] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`min-h-[40px] rounded-md text-sm font-medium ${view === v ? 'bg-accent text-base-950' : 'text-base-200'}`}
              >
                {t(`proposal.view.${v}`)}
              </button>
            ))}
          </div>
        </div>

        {view === 'proposed' && (
          <div className="flex-1 min-h-[70dvh] lg:min-h-0">
            <BuilderWorkspace projectId={PROPOSAL_ID} storage={proposalStorage} />
          </div>
        )}
        {view === 'current' && <CurrentView lab={current} />}
        {view === 'compare' && <CompareView current={current} proposed={proposal.lab} diffLines={lines} />}
      </div>

      <Modal
        open={confirm === 'apply'}
        onClose={() => setConfirm(null)}
        title={t('proposal.applyConfirmTitle')}
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>{t('common.cancel')}</Button>
          <Button onClick={onApply}>{t('proposal.apply')}</Button>
        </>}
      >
        <p className="text-sm text-base-200">{t('proposal.applyConfirmBody')}</p>
        <ul className="mt-3 space-y-1 text-sm text-base-100 list-disc ps-5">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
      </Modal>
      <Modal
        open={confirm === 'discard'}
        onClose={() => setConfirm(null)}
        title={t('proposal.discardConfirmTitle')}
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={onDiscard}>{t('proposal.discard')}</Button>
        </>}
      >
        <p className="text-sm text-base-200">{t('proposal.discardConfirmBody')}</p>
      </Modal>
    </AppShell>
  );
}

function CurrentView({ lab }: { lab: NonNullable<ReturnType<typeof loadMyLab>> }) {
  const { t } = useI18n();
  const names = new Map(lab.components.map((c) => [c.instanceId, c.name]));
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 grid gap-4">
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-base-50">{t('proposal.devices')} ({lab.components.length})</h2>
        <ul className="mt-2 space-y-1">
          {lab.components.map((c) => (
            <li key={c.instanceId} className="text-sm text-base-200 flex justify-between gap-2">
              <span className="truncate">{c.name}</span>
              <span className="text-2xs text-base-400 uppercase">{c.category}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-base-50">{t('mylab.connections')} ({lab.connections.length})</h2>
        <ul className="mt-2 space-y-1">
          {lab.connections.map((c) => (
            <li key={c.id} className="text-sm text-base-200 truncate">{names.get(c.fromId)} → {names.get(c.toId)}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function delta(a: number, b: number, fmt: (n: number) => string) {
  const d = b - a;
  if (Math.abs(d) < 1e-9) return '±0';
  return `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`;
}

function CompareView({ current, proposed, diffLines }: { current: NonNullable<ReturnType<typeof loadMyLab>>; proposed: NonNullable<ReturnType<typeof loadMyLab>>; diffLines: string[] }) {
  const { t } = useI18n();
  const a = summarizeLab(current);
  const b = summarizeLab(proposed);
  const cur = current.currency;
  const rows: { label: string; key: keyof LabSummary; fmt: (n: number) => string }[] = [
    { label: t('proposal.devices'), key: 'devices', fmt: (n) => String(n) },
    { label: t('mylab.connections'), key: 'connections', fmt: (n) => String(n) },
    { label: t('proposal.hardwareCost'), key: 'hardwareCost', fmt: (n) => formatCost(n, cur) },
    { label: t('proposal.power'), key: 'powerW', fmt: (n) => (n ? formatPower(Math.round(n)) : '0W') },
    { label: t('proposal.electricity'), key: 'monthlyCost', fmt: (n) => formatCost(n, cur) },
    { label: t('proposal.storage'), key: 'storageTB', fmt: (n) => (n ? formatStorage(n) : '0TB') },
    { label: t('proposal.fastest'), key: 'fastestGbps', fmt: (n) => (n ? formatNetwork(n) : '—') },
    { label: t('proposal.slowest'), key: 'slowestGbps', fmt: (n) => (n ? formatNetwork(n) : '—') },
  ];
  const ha = computeLabHealth(current, t);
  const hb = computeLabHealth(proposed, t);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {diffLines.length > 0 && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-base-50">{t('proposal.changes')}</h2>
          <ul className="mt-2 space-y-1 text-sm text-base-200 list-disc ps-5">{diffLines.map((l) => <li key={l}>{l}</li>)}</ul>
        </Card>
      )}
      <section>
        <h2 className="text-sm font-semibold text-base-50">{t('proposal.impact')}</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((r) => {
            const ch = a[r.key] !== b[r.key];
            return (
              <Card key={r.key} className="p-3">
                <p className="text-2xs text-base-400">{r.label}</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-mono flex-wrap">
                  <span className="text-base-300">{r.fmt(a[r.key])}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-base-500" />
                  <span className="text-base-50">{r.fmt(b[r.key])}</span>
                  <span className={`ms-auto text-xs ${ch ? 'text-accent' : 'text-base-500'}`}>{delta(a[r.key], b[r.key], r.fmt)}</span>
                </div>
              </Card>
            );
          })}
        </div>
        <p className="mt-2 text-2xs text-base-400">{t('proposal.estimateNote')}</p>
      </section>
      <HealthCompare a={ha} b={hb} />
    </div>
  );
}

function HealthCompare({ a, b }: { a: LabHealth; b: LabHealth }) {
  const { t } = useI18n();
  const actionable = (h: LabHealth) => h.checks.filter((c) => c.level === 'attention' || c.level === 'check');
  const aIds = new Set(actionable(a).map((c) => c.id));
  const bIds = new Set(actionable(b).map((c) => c.id));
  const resolved = actionable(a).filter((c) => !bIds.has(c.id));
  const introduced = actionable(b).filter((c) => !aIds.has(c.id));
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-base-50">{t('proposal.health')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HEALTH_AREAS.map((area) => (
          <Card key={area} className="p-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-base-100 me-auto">{t(`labhealth.area.${area}`)}</span>
            <StatusBadge status={a.areaStatus[area]} />
            <ArrowRight className="w-3.5 h-3.5 text-base-500" />
            <StatusBadge status={b.areaStatus[area]} />
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-success-500">{t('proposal.resolved')} ({resolved.length})</h3>
          <ul className="mt-2 space-y-1 text-sm text-base-200">
            {resolved.length ? resolved.map((c) => <li key={c.id}>{c.title}</li>) : <li className="text-base-400">{t('proposal.noneFound')}</li>}
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-warning-400">{t('proposal.introduced')} ({introduced.length})</h3>
          <ul className="mt-2 space-y-1 text-sm text-base-200">
            {introduced.length ? introduced.map((c) => <li key={c.id}>{c.title}</li>) : <li className="text-base-400">{t('proposal.noneFound')}</li>}
          </ul>
        </Card>
      </div>
      <p className="text-2xs text-base-400">{t('proposal.findingsCount', { current: aIds.size, proposed: bIds.size })}</p>
    </section>
  );
}
