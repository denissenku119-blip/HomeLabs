import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/Badge';
import { BuilderWorkspace } from '@/features/builder/BuilderWorkspace';
import { useSaveStatus } from '@/features/project/saveStatusStore';
import { useI18n } from '@/i18n/I18nContext';
import { MY_LAB_ID, createEmptyMyLab, loadMyLab, myLabStorage, saveMyLab } from '@/features/mylab/myLabStore';

/** My Lab topology: the existing builder, persisting to My Lab storage only. */
export function MyLabTopologyPage() {
  const { t } = useI18n();
  const saveStatus = useSaveStatus();
  useMemo(() => {
    if (!loadMyLab()) saveMyLab(createEmptyMyLab());
  }, []);
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => {
    setFocusId(new URLSearchParams(window.location.search).get('focus'));
  }, []);

  return (
    <AppShell
      fullHeight
      projectName={t('mylab.title')}
      topBarActions={
        <span
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-2xs text-base-300 border border-base-700 bg-base-850"
        >
          {saveStatus === 'error' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
            ) : saveStatus === 'saving' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
          ) : (
            <Save className="w-3.5 h-3.5 text-success-500" />
          )}
          <span className="hidden sm:inline">{saveStatus === 'error' ? t('save.failed') : saveStatus === 'saving' ? 'Saving…' : t('workspace.saved')}</span>
        </span>
      }
    >
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:h-full lg:min-h-0">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5 border-b border-base-700 bg-base-900 flex-shrink-0">
          <BackButton to="/app/my-lab" label={t('mylab.title')} />
          <Badge variant="success" dot>{t('mylab.badge')}</Badge>
        </div>
        <div className="flex-1 min-h-0">
          <BuilderWorkspace projectId={MY_LAB_ID} storage={myLabStorage} focusId={focusId} />
        </div>
      </div>
    </AppShell>
  );
}
