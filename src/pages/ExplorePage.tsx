import { Link } from 'react-router-dom';
import { ArrowRight, Server, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { exploreExamples } from '@/data/mockData';
import type { ExperienceLevel } from '@/types';

const difficultyVariant: Record<ExperienceLevel, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-950/80 backdrop-blur-md border-b border-base-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-base-950">
              <Server className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-base-50">
              HomeLab <span className="text-accent">Architect</span>
            </span>
          </Link>
          <Link to="/app">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <SectionHeader
          eyebrow="Explore"
          title="Example HomeLab architectures"
          description="Browse curated setups for inspiration. These are reference designs — use them as a starting point for your own project."
          action={
            <Link to="/app/new">
              <Button leftIcon={<Compass className="w-4 h-4" />}>
                Start from scratch
              </Button>
            </Link>
          }
        />

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exploreExamples.map((example) => (
            <Card key={example.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-base-50">{example.name}</h3>
                <Badge variant={difficultyVariant[example.difficulty]}>
                  {example.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-base-300 leading-relaxed flex-1">
                {example.purpose}
              </p>
              <div className="mt-4 pt-4 border-t border-base-700 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xs text-base-400 uppercase tracking-wide">Components</p>
                  <p className="text-sm font-mono font-semibold text-base-100">
                    {example.componentCount}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-base-400 uppercase tracking-wide">Est. Budget</p>
                  <p className="text-sm font-mono font-semibold text-accent">
                    ${example.estimatedBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-base-300">
            Want to design your own?
          </p>
          <Link to="/app/new" className="inline-block mt-4">
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Building Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
