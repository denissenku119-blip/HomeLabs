import { useRef, useState } from 'react';
import { Download, Upload, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nContext';
import { saveReportDocument } from '@/features/report/reportExport';
import { backupFileName, createBackup, parseBackup, restoreBackup, type BackupFileV1, type BackupSummary } from './backup';

type Status = { kind: 'ok' | 'error'; text: string } | null;

export function BackupCard() {
  const { t } = useI18n();
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState<{ backup: BackupFileV1; summary: BackupSummary } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    setStatus(null);
    const json = JSON.stringify(createBackup(), null, 2);
    const result = await saveReportDocument(json, backupFileName(), t('backup.title'), 'application/json');
    setBusy(false);
    if (result.ok) setStatus({ kind: 'ok', text: t('backup.exported') });
    else if (result.error !== 'cancelled') setStatus({ kind: 'error', text: t('backup.exportFailed') });
  };

  const handleFile = async (file: File | undefined) => {
    setStatus(null);
    setPending(null);
    if (!file) return;
    let text = '';
    try {
      text = await file.text();
    } catch {
      setStatus({ kind: 'error', text: t('backup.invalid') });
      return;
    }
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      setStatus({ kind: 'error', text: t(parsed.error === 'newer' ? 'backup.newer' : 'backup.invalid') });
      return;
    }
    setPending({ backup: parsed.backup, summary: parsed.summary });
  };

  const confirmRestore = () => {
    if (!pending) return;
    const ok = restoreBackup(pending.backup);
    setPending(null);
    setStatus(ok ? { kind: 'ok', text: t('backup.restored') } : { kind: 'error', text: t('backup.restoreFailed') });
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-base-100 mb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-accent" />
        {t('backup.title')}
      </h3>
      <p className="text-xs text-base-400 mb-2">{t('backup.autosave')}</p>
      <p className="text-xs text-base-400 mb-4">{t('backup.description')}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} disabled={busy}>
          {t('backup.export')}
        </Button>
        <Button size="sm" variant="secondary" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={() => fileInput.current?.click()}>
          {t('backup.import')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label={t('backup.import')}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {pending && (
        <div role="alertdialog" className="mt-4 rounded-lg border border-warning-500/40 bg-base-850 p-3">
          <p className="text-sm text-base-100 mb-1">{t('backup.confirmTitle')}</p>
          <p className="text-xs text-base-300 mb-3">
            {t('backup.confirmBody', {
              projects: pending.summary.projects,
              devices: pending.summary.myLabDevices ?? 0,
              date: pending.summary.createdAt ? new Date(pending.summary.createdAt).toLocaleString() : '—',
            })}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={confirmRestore}>{t('backup.confirm')}</Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      {status && (
        <p role="status" className={`mt-3 text-xs ${status.kind === 'ok' ? 'text-success-500' : 'text-danger-500'}`}>
          {status.text}
        </p>
      )}
    </Card>
  );
}
