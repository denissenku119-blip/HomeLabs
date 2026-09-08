import { useParams, useLocation, Link } from 'react-router-dom';
import { Save, Settings, FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BuilderWorkspace } from '@/features/builder/BuilderWorkspace';
import type { CreateProjectInput } from '@/types';

export function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialData = (location.state ?? null) as CreateProjectInput | null;

  if (!id) return null;

  return (
    <AppShell
      projectName={initialData?.name ?? 'Project'}
      topBarActions={
        <>
          <Button size="sm" variant="secondary" leftIcon={<Save className="w-3.5 h-3.5" />} disabled>
            <span className="hidden sm:inline">Saved</span>
          </Button>
          <Link to={`/app/project/${id}/report`}>
            <Button size="sm" variant="secondary" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">Report</span>
            </Button>
          </Link>
          <Link to="/app/settings">
            <Button size="sm" variant="ghost" leftIcon={<Settings className="w-3.5 h-3.5" />} aria-label="Settings" />
          </Link>
        </>
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-base-700 bg-base-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Badge variant="default" dot>Draft</Badge>
            <span className="text-xs text-base-400 font-mono hidden sm:inline">{id}</span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <BuilderWorkspace projectId={id} initialData={initialData} />
        </div>
      </div>
    </AppShell>
  );
}
