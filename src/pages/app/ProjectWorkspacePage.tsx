import { useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from '@/lib/router-compat';
import { Save, Settings, FileText, Trash2, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DeleteProjectDialog } from '@/components/ui/DeleteProjectDialog';
import { ShareProjectButton } from '@/components/ShareProjectButton';
import { BuilderWorkspace } from '@/features/builder/BuilderWorkspace';
import { deleteProjectRepo } from '@/repositories/projectRepository';
import { findProject } from '@/utils/projectLookup';
import { useSaveStatus } from '@/features/project/saveStatusStore';
import { useI18n } from '@/i18n/I18nContext';
import type { CreateProjectInput } from '@/types';

export function ProjectWorkspacePage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // TanStack always exposes a location state object (router bookkeeping keys),
  // so only treat it as creation data when it actually carries a project name.
  const rawState = location.state as unknown as Partial<CreateProjectInput> | null;
  const initialData: CreateProjectInput | null =
    rawState && typeof rawState.name === 'string' && rawState.name.trim().length > 0
      ? (rawState as CreateProjectInput)
      : null;
  const saveStatus = useSaveStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const existing = useMemo(() => findProject(id), [id]);

  if (!id) return null;

  const handleDelete = () => {
    try {
      deleteProjectRepo(id);
      setConfirmOpen(false);
      setDeleteError(null);
      navigate('/app/projects');
    } catch {
      setDeleteError('Could not delete this project. Please try again.');
    }
  };

  return (
    <AppShell
      fullHeight
      projectName={existing?.name ?? initialData?.name ?? 'Project'}
      topBarActions={
        <>
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-2xs text-base-300 border border-base-700 bg-base-850"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Save className="w-3.5 h-3.5 text-success-500" />
            )}
            <span className="hidden sm:inline">
              {saveStatus === 'saving' ? 'Saving…' : t('workspace.saved')}
            </span>
          </span>
          <ShareProjectButton project={existing ?? null} />
          <Link to={`/app/project/${id}/report`}>
            <Button size="sm" variant="secondary" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">{t('workspace.report')}</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            aria-label="Delete project"
            onClick={() => {
              setDeleteError(null);
              setConfirmOpen(true);
            }}
          />
          <Link to="/app/settings">
            <Button size="sm" variant="ghost" leftIcon={<Settings className="w-3.5 h-3.5" />} aria-label={t('navigation.settings')} />
          </Link>
        </>
      }
    >
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:h-full lg:min-h-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-base-700 bg-base-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BackButton to="/app/projects" label={t('navigation.projects')} />
            <Badge variant="default" dot>{t('common.draft')}</Badge>
            <span className="text-xs text-base-400 font-mono hidden sm:inline">{id}</span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <BuilderWorkspace projectId={id} initialData={initialData} />
        </div>
      </div>

      <DeleteProjectDialog
        open={confirmOpen}
        projectName={existing?.name ?? initialData?.name}
        error={deleteError}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
