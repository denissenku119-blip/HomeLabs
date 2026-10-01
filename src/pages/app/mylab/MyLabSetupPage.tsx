import { useMemo, useState } from 'react';
import { Minus, Plus, ChevronDown, ChevronUp, Check, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nContext';
import { hardwareCatalog } from '@/data/hardware';
import { usePlan, isStarterHardware } from '@/features/entitlements/plan';
import { createProjectComponentFromHardware } from '@/utils/projectStore';
import type { ProjectComponent } from '@/types';
import {
  DEVICE_GROUPS,
  DEVICE_TYPES,
  buildConnections,
  canLink,
  getDeviceType,
  layoutDevices,
  makeDraftDevice,
  type DraftDevice,
} from '@/features/mylab/setupModel';
import { createEmptyMyLab, hasMyLab, loadMyLab, saveMyLab } from '@/features/mylab/myLabStore';

type Step = 'choose' | 'configure' | 'connect';

const inputClass =
  'w-full min-h-11 px-3 rounded-lg bg-base-850 border border-base-700 text-sm text-base-50 placeholder:text-base-500 focus:outline-none focus:border-accent';

export function MyLabSetupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isPro } = usePlan();
  const existingLab = useMemo(() => hasMyLab(), []);
  const [step, setStep] = useState<Step>('choose');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [devices, setDevices] = useState<DraftDevice[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string[]>>({});

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const steps: Step[] = ['choose', 'configure', 'connect'];
  const stepIndex = steps.indexOf(step);

  const setCount = (id: string, delta: number) =>
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(20, (c[id] ?? 0) + delta)) }));

  const goConfigure = () => {
    // Keep already configured devices; add/remove only to match the counts.
    const next: DraftDevice[] = [];
    for (const type of DEVICE_TYPES) {
      const wanted = counts[type.id] ?? 0;
      const kept = devices.filter((d) => d.typeId === type.id).slice(0, wanted);
      next.push(...kept);
      for (let i = kept.length; i < wanted; i += 1) {
        const d = makeDraftDevice(type.id, wanted > 1 ? i + 1 : 1);
        if (d) next.push(d);
      }
    }
    const keys = new Set(next.map((d) => d.key));
    setLinks((l) =>
      Object.fromEntries(
        Object.entries(l)
          .filter(([k]) => keys.has(k))
          .map(([k, v]) => [k, v.filter((x) => keys.has(x))]),
      ),
    );
    setDevices(next);
    setOpenKey(next[0]?.key ?? null);
    setStep('configure');
  };

  const updateDevice = (key: string, updates: Partial<ProjectComponent>, override = true) =>
    setDevices((ds) =>
      ds.map((d) =>
        d.key === key
          ? { ...d, component: { ...d.component, ...updates, hasOverrides: override || d.component.hasOverrides } }
          : d,
      ),
    );

  const hubs = devices.filter((d) => devices.some((o) => canLink(d, o)));

  const toggleLink = (hubKey: string, otherKey: string) =>
    setLinks((l) => {
      const current = l[hubKey] ?? [];
      return {
        ...l,
        [hubKey]: current.includes(otherKey) ? current.filter((k) => k !== otherKey) : [...current, otherKey],
      };
    });

  const finish = () => {
    const base = loadMyLab() ?? createEmptyMyLab();
    saveMyLab({
      ...base,
      components: layoutDevices(devices),
      connections: buildConnections(devices, links),
      updatedAt: new Date().toISOString(),
    });
    navigate('/app/my-lab/topology');
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
        <BackButton to="/app/my-lab" label={t('mylab.title')} />
        <h1 className="mt-4 text-xl font-bold text-base-50">{t('mylab.setup.title')}</h1>
        <p className="mt-1 text-sm text-base-300">{t('mylab.setup.subtitle')}</p>

        <ol className="mt-5 grid grid-cols-3 gap-2" aria-label={t('mylab.setup.title')}>
          {steps.map((s, i) => (
            <li
              key={s}
              className={cn(
                'rounded-lg border px-2 py-2 text-center text-2xs font-medium',
                i === stepIndex
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : i < stepIndex
                    ? 'border-base-700 text-base-200'
                    : 'border-base-800 text-base-500',
              )}
            >
              {i + 1}. {t(`mylab.step.${s}`)}
            </li>
          ))}
        </ol>

        {existingLab && (
          <p className="mt-4 rounded-lg border border-warning-500/30 bg-warning-500/10 px-3 py-2 text-xs text-warning-400">
            {t('mylab.setup.replaceWarning')}
          </p>
        )}

        {step === 'choose' && (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-base-200">{t('mylab.choose.help')}</p>
            {DEVICE_GROUPS.map((group) => {
              const types = DEVICE_TYPES.filter((d) => d.group === group);
              if (!types.length) return null;
              return (
                <section key={group}>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-base-400 mb-2">
                    {t(`mylab.group.${group}`)}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {types.map((type) => {
                      const n = counts[type.id] ?? 0;
                      return (
                        <div
                          key={type.id}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border px-3 py-2',
                            n > 0 ? 'border-accent/40 bg-accent/5' : 'border-base-700 bg-base-900',
                          )}
                        >
                          <span className="flex-1 text-sm text-base-100">{t(type.labelKey)}</span>
                          <button
                            type="button"
                            aria-label={`${t('mylab.remove')} ${t(type.labelKey)}`}
                            onClick={() => setCount(type.id, -1)}
                            disabled={n === 0}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-base-700 text-base-200 disabled:opacity-30"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-mono text-sm text-base-50" aria-live="polite">{n}</span>
                          <button
                            type="button"
                            aria-label={`${t('mylab.add')} ${t(type.labelKey)}`}
                            onClick={() => setCount(type.id, 1)}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-base-700 text-accent"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {step === 'configure' && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-base-200">{t('mylab.configure.help')}</p>
            {devices.map((d) => (
              <DeviceEditor
                key={d.key}
                device={d}
                open={openKey === d.key}
                isPro={isPro}
                onToggle={() => setOpenKey((k) => (k === d.key ? null : d.key))}
                onChange={(u) => updateDevice(d.key, u)}
                onPick={(hwId) => {
                  const hw = hardwareCatalog.find((h) => h.id === hwId);
                  if (!hw) return;
                  const fresh = createProjectComponentFromHardware(hw, 0, 0);
                  updateDevice(d.key, { ...fresh, instanceId: d.key }, false);
                }}
              />
            ))}
          </div>
        )}

        {step === 'connect' && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-base-200">{t('mylab.connect.help')}</p>
            {hubs.length === 0 && (
              <Card className="p-4 text-sm text-base-300">{t('mylab.connect.none')}</Card>
            )}
            {hubs.map((hub) => {
              const options = devices.filter((o) => canLink(hub, o));
              const selected = links[hub.key] ?? [];
              return (
                <Card key={hub.key} className="p-4">
                  <h2 className="text-sm font-semibold text-base-50">
                    {t('mylab.connect.question', { name: hub.component.name })}
                  </h2>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {options.map((o) => {
                      const on = selected.includes(o.key);
                      return (
                        <button
                          key={o.key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleLink(hub.key, o.key)}
                          className={cn(
                            'flex items-center gap-3 min-h-11 rounded-lg border px-3 py-2 text-start text-sm transition-colors',
                            on ? 'border-accent/50 bg-accent/10 text-base-50' : 'border-base-700 text-base-200',
                          )}
                        >
                          <span
                            className={cn(
                              'w-5 h-5 inline-flex items-center justify-center rounded border',
                              on ? 'bg-accent border-accent text-base-950' : 'border-base-600',
                            )}
                          >
                            {on && <Check className="w-3.5 h-3.5" />}
                          </span>
                          {o.component.name}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
            <p className="text-xs text-base-400">{t('mylab.connect.later')}</p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-base-700 bg-base-900/95 backdrop-blur safe-bottom lg:ps-60">
        <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 sm:px-6 py-3">
          {stepIndex > 0 && (
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(steps[stepIndex - 1])}>
              {t('common.back')}
            </Button>
          )}
          <span className="text-xs text-base-400 ms-auto">{t('mylab.deviceCount', { count: total })}</span>
          {step === 'choose' && (
            <Button disabled={total === 0} rightIcon={<ArrowRight className="w-4 h-4" />} onClick={goConfigure}>
              {t('common.next')}
            </Button>
          )}
          {step === 'configure' && (
            <Button rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setStep('connect')}>
              {t('common.next')}
            </Button>
          )}
          {step === 'connect' && (
            <Button leftIcon={<Check className="w-4 h-4" />} onClick={finish}>
              {t('mylab.connect.finish')}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

interface DeviceEditorProps {
  device: DraftDevice;
  open: boolean;
  isPro: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<ProjectComponent>) => void;
  onPick: (hardwareId: string) => void;
}

function DeviceEditor({ device, open, isPro, onToggle, onChange, onPick }: DeviceEditorProps) {
  const { t } = useI18n();
  const [advanced, setAdvanced] = useState(false);
  const [query, setQuery] = useState('');
  const c = device.component;
  const type = getDeviceType(device.typeId);

  const choices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hardwareCatalog
      .filter((h) => h.category === c.category)
      .filter((h) => isPro || isStarterHardware(h.id) || h.id === type?.defaultHardwareId)
      .filter((h) => !q || `${h.name} ${h.manufacturer} ${h.model}`.toLowerCase().includes(q));
  }, [c.category, isPro, query, type?.defaultHardwareId]);

  const num = (v: string) => (v === '' ? 0 : Math.max(0, Number(v) || 0));
  const optNum = (v: string) => (v === '' ? undefined : Math.max(0, Number(v) || 0));

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 min-h-12 text-start"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-base-50 truncate">{c.name}</span>
          <span className="block text-2xs text-base-400">{type ? t(type.labelKey) : c.category}</span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-base-300" /> : <ChevronDown className="w-4 h-4 text-base-300" />}
      </button>
      {open && (
        <div className="border-t border-base-700 px-4 py-4 space-y-3">
          <label className="block">
            <span className="text-xs text-base-300">{t('mylab.field.catalog')}</span>
            <div className="relative mt-1">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-base-500" />
              <input
                className={cn(inputClass, 'ps-9')}
                value={query}
                placeholder={t('mylab.field.search')}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={cn(inputClass, 'mt-2')}
              value={choices.some((h) => h.id === c.hardwareDefinitionId) ? c.hardwareDefinitionId : ''}
              onChange={(e) => e.target.value && onPick(e.target.value)}
            >
              <option value="">{t('mylab.field.pick')}</option>
              {choices.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            {!isPro && <span className="mt-1 block text-2xs text-base-500">{t('mylab.field.starterOnly')}</span>}
          </label>
          <Field label={t('mylab.field.name')}>
            <input className={inputClass} value={c.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('mylab.field.manufacturer')}>
              <input className={inputClass} value={c.manufacturer} onChange={(e) => onChange({ manufacturer: e.target.value })} />
            </Field>
            <Field label={t('mylab.field.model')}>
              <input className={inputClass} value={c.model} onChange={(e) => onChange({ model: e.target.value })} />
            </Field>
            <Field label={t('mylab.field.price')}>
              <input className={inputClass} inputMode="decimal" type="number" min={0} value={c.price || ''} onChange={(e) => onChange({ price: num(e.target.value) })} />
            </Field>
            <Field label={t('mylab.field.power')}>
              <input className={inputClass} inputMode="decimal" type="number" min={0} value={c.powerWatts || ''} onChange={(e) => onChange({ powerWatts: num(e.target.value) })} />
            </Field>
          </div>
          <button
            type="button"
            onClick={() => setAdvanced((a) => !a)}
            className="inline-flex items-center gap-1 min-h-11 text-xs font-medium text-accent"
            aria-expanded={advanced}
          >
            {advanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {t('mylab.field.more')}
          </button>
          {advanced && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('mylab.field.cpu')}>
                <input className={inputClass} type="number" min={0} value={c.cpuCores ?? ''} onChange={(e) => onChange({ cpuCores: optNum(e.target.value) })} />
              </Field>
              <Field label={t('mylab.field.ram')}>
                <input className={inputClass} type="number" min={0} value={c.ramGB ?? ''} onChange={(e) => onChange({ ramGB: optNum(e.target.value) })} />
              </Field>
              <Field label={t('mylab.field.storage')}>
                <input className={inputClass} type="number" min={0} step="0.1" value={c.storageTB || ''} onChange={(e) => onChange({ storageTB: num(e.target.value) })} />
              </Field>
              <Field label={t('mylab.field.network')}>
                <input className={inputClass} type="number" min={0} step="0.1" value={c.networkSpeedGbps || ''} onChange={(e) => onChange({ networkSpeedGbps: num(e.target.value) })} />
              </Field>
              <div className="col-span-2">
                <Field label={t('mylab.field.notes')}>
                  <textarea className={cn(inputClass, 'py-2 min-h-20')} value={c.notes ?? ''} onChange={(e) => onChange({ notes: e.target.value || undefined })} />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-base-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
