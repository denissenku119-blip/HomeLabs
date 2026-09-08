import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Plus, FolderOpen, Cpu, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { mockProjects } from '@/data/mockData';
import { loadAllProjects } from '@/utils/projectStore';
import { calculateAnalysis } from '@/utils/calculations';
import { useI18n } from '@/i18n/I18nContext';

export function DashboardPage() {
  const { t, locale } = useI18n();
  const savedProjects = useMemo(() => loadAllProjects(), []);
  const projects = [...savedProjects, ...mockProjects];
  const hasProjects = projects.length > 0;

  const totalCost = projects.reduce(
    (sum, p) => sum + calculateAnalysis(p.components, p.connections).totalCost,
    0
  );
  const totalComponents = projects.reduce((sum, p) => sum + p.components.length, 0);
  const totalPower = projects.reduce(
    (sum, p) => sum + calculateAnalysis(p.components, p.connections).totalPowerWatts,
    0
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          title={t('dashboard.yourHomelab')}
          description={t('dashboard.description')}
          action={
            <Link to="/app/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                {t('dashboard.newHomelab')}
              </Button>
            </Link>
          }
        />

        {hasProjects && (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t('dashboard.projects')} value={projects.length} icon={<FolderOpen className="w-4 h-4" />} />
            <StatCard label={t('dashboard.components')} value={totalComponents} icon={<Cpu className="w-4 h-4" />} />
            <StatCard label={t('dashboard.totalEstCost')} value={totalCost > 0 ? totalCost.toLocaleString(locale) : '—'} variant="accent" />
            <StatCard label={t('dashboard.totalPower')} value={totalPower > 0 ? totalPower : '—'} unit={totalPower > 0 ? 'W' : ''} />
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-base-50">{t('dashboard.recentProjects')}</h2>
            {hasProjects && (
              <Link
                to="/app/projects"
                className="text-sm font-medium text-accent hover:text-accent-300 transition-colors inline-flex items-center gap-1"
              >
                {t('dashboard.viewAll')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {hasProjects ? (
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
                title={t('dashboard.noProjectsYet')}
                description={t('dashboard.createFirstDescription')}
                action={
                  <Link to="/app/new">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      {t('dashboard.createFirstProject')}
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
