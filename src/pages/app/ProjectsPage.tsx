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

export function ProjectsPage() {
  const savedProjects = useMemo(() => loadAllProjects(), []);
  const projects = [...savedProjects, ...mockProjects];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          title="My Projects"
          description="All your HomeLab designs in one place."
          action={
            <Link to="/app/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                New HomeLab
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
                title="No projects yet"
                description="Create your first HomeLab project to start designing your infrastructure."
                action={
                  <Link to="/app/new">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      Create your first project
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
