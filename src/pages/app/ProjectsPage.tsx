import { Link } from '@/lib/router-compat';
import { useCallback, useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { DeleteProjectDialog } from '@/components/ui/DeleteProjectDialog';
import { RenameProjectDialog } from '@/components/ui/RenameProjectDialog';
import { mockProjects } from '@/data/mockData';
import { getProject, getProjects, deleteProjectRepo, saveProjectRepo } from '@/repositories/projectRepository';
import { calculateAnalysis } from '@/utils/calculations';
import { useI18n } from '@/i18n/I18nContext';

export function ProjectsPage() {
  const { t } = useI18n();
  const [savedProjects, setSavedProjects] = useState(() => getProjects());
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [pendingRename, setPendingRename] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmRename = useCallback(
    (name: string) => {
      if (!pendingRename) return;
      // Renaming updates the existing record in place — same id, same data.
      const existing = getProject(pendingRename.id);
      if (existing) saveProjectRepo({ ...existing, name });
      setSavedProjects(getProjects());
      setPendingRename(null);
    },
    [pendingRename],
  );

  const projects = [...savedProjects, ...mockProjects];
  const savedIds = new Set(savedProjects.map((p) => p.id));

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    try {
      deleteProjectRepo(pendingDelete.id);
      setSavedProjects(getProjects());
      setPendingDelete(null);
      setDeleteError(null);
    } catch {
      setDeleteError('Could not delete this project. Please try again.');
    }
  }, [pendingDelete]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          title={t('projects.title')}
          description={t('projects.description')}
          action={
            <Link to="/app/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                {t('projects.newHomelab')}
              </Button>
            </Link>
          }
        />

        <div className="mt-8">
          {projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  status={project.status}
                  components={project.components}
                  estimatedCost={calculateAnalysis(project.components, project.connections).totalCost}
                  onDelete={
                    savedIds.has(project.id)
                      ? () => {
                          setDeleteError(null);
                          setPendingDelete({ id: project.id, name: project.name });
                        }
                      : undefined
                  }
                  onRename={
                    savedIds.has(project.id)
                      ? () => setPendingRename({ id: project.id, name: project.name })
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<FolderOpen className="w-8 h-8" />}
                title={t('projects.noProjectsYet')}
                description={t('projects.createFirstDescription')}
                action={
                  <Link to="/app/new">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      {t('projects.createFirstProject')}
                    </Button>
                  </Link>
                }
              />
            </Card>
          )}
        </div>
      </div>

      <DeleteProjectDialog
        open={pendingDelete !== null}
        projectName={pendingDelete?.name}
        error={deleteError}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
      />

      <RenameProjectDialog
        open={pendingRename !== null}
        currentName={pendingRename?.name}
        onCancel={() => setPendingRename(null)}
        onConfirm={confirmRename}
      />
    </AppShell>
  );
}
