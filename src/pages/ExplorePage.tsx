import { Link } from '@/lib/router-compat';
import { ArrowRight, Server, Compass, HardDrive, Crown, Check } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { PRO_BENEFITS } from '@/features/entitlements/plan';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackButton } from '@/components/layout/BackButton';
import { exploreExamples } from '@/data/mockData';
import type { ExperienceLevel } from '@/types';

const difficultyVariant: Record<ExperienceLevel, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export function ExplorePage() {
  return (
    <div className="public-page-scroll flex flex-col">
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
        <BackButton to="/" label="Back to home" className="mb-4" />
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

        <ExploreMyLabPro />

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

function ExploreMyLabPro() {
  const { t } = useI18n();
  return (
    <section className="mt-14 grid lg:grid-cols-2 gap-4">
      <Card className="p-6">
        <p className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-accent">
          <HardDrive className="w-3.5 h-3.5" /> {t('explore.mylab.eyebrow')}
        </p>
        <h2 className="mt-2 text-xl font-bold text-base-50">{t('explore.mylab.title')}</h2>
        <p className="mt-2 text-sm text-base-300 leading-relaxed">{t('explore.mylab.body')}</p>
        <div className="mt-5 rounded-xl border border-base-700 bg-base-850 p-4">
          <h3 className="text-sm font-semibold text-base-50">{t('explore.mylab.diff.title')}</h3>
          <p className="mt-2 text-xs text-base-300">{t('explore.mylab.diff.projects')}</p>
          <p className="mt-1.5 text-xs text-base-300">{t('explore.mylab.diff.mylab')}</p>
        </div>
        <h3 className="mt-5 text-sm font-semibold text-base-50">{t('explore.mylab.why.title')}</h3>
        <ul className="mt-2 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-base-200 leading-relaxed">
              <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
              {t(`explore.mylab.why.${i}`)}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-6 border-accent/30">
        <p className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-accent">
          <Crown className="w-3.5 h-3.5" /> {t('progate.proBadge')}
        </p>
        <h2 className="mt-2 text-xl font-bold text-base-50">{t('explore.pro.title')}</h2>
        <p className="mt-1 text-sm text-accent font-semibold">{t('pro.price')}</p>
        <p className="mt-1 text-xs text-base-400">{t('explore.pro.subtitle')}</p>
        <ul className="mt-5 space-y-2.5">
          {PRO_BENEFITS.map((b, index) => (
            <li key={b} className="flex items-start gap-2 text-sm text-base-100">
              <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
              {t(`pro.benefit.${index + 1}`)}
            </li>
          ))}
        </ul>
        <Link to="/app" className="inline-block mt-6">
          <Button rightIcon={<ArrowRight className="w-4 h-4" />}>{t('explore.pro.cta')}</Button>
        </Link>
      </Card>
    </section>
  );
}
