import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  HardDrive,
  Zap,
  DollarSign,
  Network,
  Wrench,
  ClipboardList,
  Shield,
  BookOpen,
  Lock,
  Server,
  MonitorSmartphone,
  Activity,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { NetworkTopology } from '@/components/NetworkTopology';
import { useI18n } from '@/i18n/I18nContext';

/* ---------- Public Header ---------- */
function PublicHeader() {
  const { t } = useI18n();
  return (
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
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/explore"
            className="px-3 py-2 text-sm font-medium text-base-200 hover:text-base-50 transition-colors"
          >
            {t('landing.explore')}
          </Link>
          <Link
            to="/about"
            className="px-3 py-2 text-sm font-medium text-base-200 hover:text-base-50 transition-colors"
          >
            {t('landing.about')}
          </Link>
          <Link to="/app">
            <Button size="sm" className="ml-1">
              {t('landing.launchApp')}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-base-800">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-950/40 to-base-950" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-6 animate-fade-in">
            <span className="text-2xs font-semibold text-accent uppercase tracking-wider">
              {t('landing.homelabPlanning')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-50 leading-tight text-balance">
              {t('landing.designYourHomelab')}
              <br />
              <span className="text-accent">{t('landing.beforeYouBuyIt')}</span>
            </h1>
            <p className="text-base sm:text-lg text-base-200 max-w-xl leading-relaxed">
              {t('landing.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link to="/app/new">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}>
                  {t('landing.startBuildingFree')}
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="secondary">
                  {t('landing.exploreTheArchitect')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <Card padding="none" className="p-6 bg-base-900/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-base-300">
                  architecture-preview.lab
                </span>
                <Badge variant="accent" dot>
                  Live Preview
                </Badge>
              </div>
              <NetworkTopology />
              <div className="mt-4 grid grid-cols-4 gap-2 pt-4 border-t border-base-700">
                <div>
                  <p className="text-2xs text-base-400 uppercase">Cost</p>
                  <p className="text-sm font-mono font-bold text-accent">$1,164</p>
                </div>
                <div>
                  <p className="text-2xs text-base-400 uppercase">Power</p>
                  <p className="text-sm font-mono font-bold text-base-100">107W</p>
                </div>
                <div>
                  <p className="text-2xs text-base-400 uppercase">Storage</p>
                  <p className="text-sm font-mono font-bold text-base-100">16TB</p>
                </div>
                <div>
                  <p className="text-2xs text-base-400 uppercase">Score</p>
                  <p className="text-sm font-mono font-bold text-success-400">82</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem Section ---------- */
function ProblemSection() {
  const challenges = [
    { icon: Cpu, label: 'Hardware research' },
    { icon: Zap, label: 'Power calculations' },
    { icon: HardDrive, label: 'Storage planning' },
    { icon: Network, label: 'Networking decisions' },
    { icon: Shield, label: 'Backup planning' },
    { icon: DollarSign, label: 'Budgets' },
    { icon: ClipboardList, label: 'Documentation' },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-base-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="The Problem"
          title="Buying hardware is easy. Designing the right system is harder."
          description="HomeLab builders often piece together scattered research across spreadsheets, forums, and sticky notes. HomeLab Architect brings every decision into one workspace."
        />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {challenges.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 p-4 bg-base-900 border border-base-700 rounded-lg text-center"
              >
                <Icon className="w-5 h-5 text-base-300" />
                <span className="text-xs font-medium text-base-200">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Wrench,
      title: 'Build',
      description: 'Add your hardware and connect your architecture.',
    },
    {
      number: '02',
      icon: Activity,
      title: 'Analyze',
      description: 'Understand cost, storage, power, networking and risks.',
    },
    {
      number: '03',
      icon: ClipboardList,
      title: 'Blueprint',
      description: 'Generate a clear architecture report you can save, share or use while building.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-base-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="How It Works"
          title="Three steps from idea to blueprint."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="relative overflow-hidden">
                <span className="absolute top-4 right-4 text-4xl font-bold font-mono text-base-700/50 select-none">
                  {step.number}
                </span>
                <div className="flex flex-col gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-base-50">{step.title}</h3>
                  <p className="text-sm text-base-300">{step.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Product Preview ---------- */
function ProductPreviewSection() {
  const warnings = [
    { severity: 'warning', text: 'No UPS detected — power outage risk to storage.', icon: AlertTriangle },
    { severity: 'info', text: 'Single switch — consider redundancy for critical services.', icon: Lightbulb },
  ];

  const recommendations = [
    'Add a UPS to protect your NAS from unexpected power loss.',
    'Consider a second network path for high-availability services.',
    'Enable SMART monitoring on all storage drives.',
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-base-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Product Preview"
          title="A realistic HomeLab blueprint, not marketing decoration."
          description="This is what your finished design looks like — a complete architecture overview with cost, power, storage, network analysis, and actionable recommendations."
        />

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          {/* Architecture diagram */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-base-100">Architecture Diagram</h3>
              <Badge variant="success" dot>Healthy</Badge>
            </div>
            <NetworkTopology />
          </Card>

          {/* Analysis stats */}
          <div className="flex flex-col gap-4">
            <StatCard label="Total Cost" value="$1,164" variant="accent" icon={<DollarSign className="w-4 h-4" />} />
            <StatCard label="Power Draw" value="107" unit="W" icon={<Zap className="w-4 h-4" />} />
            <StatCard label="Storage" value="16" unit="TB" icon={<HardDrive className="w-4 h-4" />} />
            <StatCard label="Network" value="1" unit="Gbps" icon={<Network className="w-4 h-4" />} />
            <StatCard label="Architecture Score" value="82" variant="success" icon={<Activity className="w-4 h-4" />} hint="Out of 100" />
          </div>
        </div>

        {/* Warnings & Recommendations */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">Warnings</h3>
            <ul className="flex flex-col gap-3">
              {warnings.map((w, i) => {
                const Icon = w.icon;
                const color =
                  w.severity === 'warning'
                    ? 'text-warning-400 bg-warning-50/30'
                    : 'text-info-400 bg-info-50/30';
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-base-200 pt-1.5">{w.text}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">Recommendations</h3>
            <ul className="flex flex-col gap-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-accent/10 text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-base-200 pt-1.5">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ---------- Who It Is For ---------- */
function WhoForSection() {
  const audiences = [
    { icon: BookOpen, title: 'First-Time HomeLab Builders', desc: 'Start with a plan, not a pile of hardware.' },
    { icon: Server, title: 'Self-Hosters', desc: 'Map every service to the right machine.' },
    { icon: HardDrive, title: 'NAS Builders', desc: 'Plan storage capacity and redundancy properly.' },
    { icon: MonitorSmartphone, title: 'Proxmox Enthusiasts', desc: 'Design VM and container layouts before deploy.' },
    { icon: Network, title: 'Home Networking Enthusiasts', desc: 'Visualize your network topology and identify gaps.' },
    { icon: Lock, title: 'IT / Cybersecurity Learners', desc: 'Build isolated labs safely and document them.' },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-base-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Who It Is For"
          title="Built for people who think in racks, VLANs, and terabytes."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {audiences.map((a) => {
            const Icon = a.icon;
            return (
              <Card key={a.title} hover>
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-base-850 border border-base-700 text-accent flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-base-50">{a.title}</h3>
                    <p className="text-sm text-base-300 mt-1">{a.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-base-50 text-balance">
          Your next HomeLab starts on the blueprint.
        </h2>
        <p className="mt-4 text-base text-base-300">
          Design it, analyze it, and build it right — the first time.
        </p>
        <Link to="/app/new" className="inline-block mt-8">
          <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Building Free
          </Button>
        </Link>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-base-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-base-950">
            <Server className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="text-xs font-medium text-base-300">
            HomeLab Architect — Design it before you buy it.
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-base-400">
          <Link to="/explore" className="hover:text-base-200 transition-colors">Explore</Link>
          <Link to="/about" className="hover:text-base-200 transition-colors">About</Link>
          <Link to="/app" className="hover:text-base-200 transition-colors">Launch</Link>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <div className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <WhoForSection />
        <FinalCTA />
      </div>
      <Footer />
    </div>
  );
}
