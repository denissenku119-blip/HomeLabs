import { Link } from 'react-router-dom';
import { Server, Target, Wrench, Activity, ClipboardList, ArrowRight, Shield, FileText, HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { APP_VERSION, APP_NAME } from '@/config/app';

const values = [
  { icon: Target, title: 'Design first', desc: 'Plan the full system before spending a dollar on hardware.' },
  { icon: Wrench, title: 'Built by enthusiasts', desc: 'Made by homelabbers, for homelabbers — not adapted from enterprise tooling.' },
  { icon: Activity, title: 'Analysis that matters', desc: 'Cost, power, storage, and network insights that actually inform decisions.' },
  { icon: ClipboardList, title: 'Professional output', desc: 'Turn your design into a blueprint you can follow while building.' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-950/80 backdrop-blur-md border-b border-base-800 safe-top">
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

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeader
          eyebrow="About"
          title="HomeLab Architect exists to make homelab planning easier."
        />

        <div className="mt-8 flex flex-col gap-6">
          <p className="text-base text-base-200 leading-relaxed">
            Instead of buying hardware first and figuring everything out afterward,
            HomeLab Architect lets you design the system first. You add components,
            connect them, and immediately see what your homelab will cost, how much
            power it will draw, how much storage you will have, and what your network
            will look like — all before you make a single purchase.
          </p>
          <p className="text-base text-base-200 leading-relaxed">
            The goal is simple: help builders make better decisions, avoid expensive
            mistakes, and end up with a homelab they actually understand.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title}>
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-base-50">{v.title}</h3>
                    <p className="text-sm text-base-300 mt-1">{v.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Information sections */}
        <div className="mt-12 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-base-100">Information</h2>

          <Card>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                <Info className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-base-50">Version</h3>
                <p className="text-sm text-base-300 mt-1">
                  {APP_NAME} v{APP_VERSION}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                <Shield className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-base-50">Privacy</h3>
                <p className="text-sm text-base-300 mt-1 leading-relaxed">
                  {APP_NAME} stores your projects locally on your device. No account is required,
                  and your project data is not sent to any server. This section will be updated
                  with a full Privacy Policy before the production release.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-base-50">Terms & Disclaimer</h3>
                <p className="text-sm text-base-300 mt-1 leading-relaxed">
                  All calculations — cost, power, storage, and network — are estimates based on
                  typical hardware specifications. Actual results will vary. Always verify
                  specifications with manufacturers before purchasing. A full Terms of Service
                  will be published before the production release.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-base-50">Support & Feedback</h3>
                <p className="text-sm text-base-300 mt-1 leading-relaxed">
                  Support channels and a feedback form will be available in the production release.
                  For now, this application is in active development.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link to="/app/new" className="inline-block">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Building Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
