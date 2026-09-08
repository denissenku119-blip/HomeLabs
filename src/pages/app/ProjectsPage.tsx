import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockProjects } from '@/data/mockData';
import { loadAllProjects } from '@/utils/projectStore';
import { calculateAnalysis } from '@/utils/calculations';
import { useI18n } from '@/i18n/I18nContext';

export function ProjectsPage() {
  const { t } = useI18n();
  const savedProjects = useMemo(() => loadAllProjects(), []);
  const projects = [...savedProjects, ...mockProjects];

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
    </AppShell>
  );
}
