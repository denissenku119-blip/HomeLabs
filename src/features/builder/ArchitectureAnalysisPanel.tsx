import { useState, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle, Info, XCircle, ChevronDown, ChevronRight,
  Lightbulb, Gauge, Network, Server, HardDrive, Zap, Shield, DollarSign,
  TrendingUp, AlertOctagon,
} from 'lucide-react';
import type { ArchitectureAnalysis, Finding, Severity, AnalysisCategory } from '@/features/analysis/types';
import { cn } from '@/lib/utils';

interface ArchitectureAnalysisPanelProps {
  analysis: ArchitectureAnalysis;
}

const SEVERITY_ICONS: Record<Severity, React.ElementType> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
};

const SEVERITY_COLORS: Record<Severity, { icon: string; bg: string; border: string; text: string }> = {
  good: { icon: 'text-success-400', bg: 'bg-success-50/10', border: 'border-success-500/20', text: 'text-success-400' },
  warning: { icon: 'text-warning-400', bg: 'bg-warning-50/10', border: 'border-warning-500/20', text: 'text-warning-400' },
  critical: { icon: 'text-danger-400', bg: 'bg-danger-50/10', border: 'border-danger-500/20', text: 'text-danger-400' },
  info: { icon: 'text-base-400', bg: 'bg-base-850', border: 'border-base-700', text: 'text-base-300' },
};

const SCORE_ICON_BY_RANGE: { min: number; icon: React.ElementType; color: string }[] = [
  { min: 85, icon: CheckCircle2, color: 'text-success-400' },
  { min: 70, icon: Gauge, color: 'text-accent' },
  { min: 50, icon: Info, color: 'text-warning-400' },
  { min: 1, icon: AlertTriangle, color: 'text-warning-400' },
  { min: 0, icon: AlertOctagon, color: 'text-base-500' },
];

function getScoreIcon(score: number) {
  for (const entry of SCORE_ICON_BY_RANGE) {
    if (score >= entry.min) return entry;
  }
  return SCORE_ICON_BY_RANGE[SCORE_ICON_BY_RANGE.length - 1];
}

const CATEGORY_ICONS: Record<AnalysisCategory, React.ElementType> = {
  network: Network,
  compute: Server,
  storage: HardDrive,
  backup: HardDrive,
  power: Zap,
  reliability: Shield,
  budget: DollarSign,
  scalability: TrendingUp,
  'data-completeness': Info,
};

export function ArchitectureAnalysisPanel({ analysis }: ArchitectureAnalysisPanelProps) {
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const sortedFindings = useMemo(() => {
    const order: Record<Severity, number> = { critical: 0, warning: 1, good: 2, info: 3 };
    return [...analysis.allFindings].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [analysis.allFindings]);

  const scoreIcon = getScoreIcon(analysis.score);
  const ScoreIcon = scoreIcon.icon;

  if (analysis.isEmpty) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
          <h2 className="text-sm font-semibold text-base-100">Architecture Health</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Gauge className="w-10 h-10 text-base-600 mx-auto mb-3" />
            <p className="text-xs text-base-400">
              Start building your architecture
              <br />
              to receive analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleFinding = (id: string) =>
    setExpandedFinding((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-base-100">Architecture Health</h2>
        <p className="text-2xs text-base-400 mt-0.5">Based on the architecture you've modeled</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Score display */}
        <div className="px-3 py-3 border-b border-base-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-base-850 border border-base-700 flex-shrink-0">
              <ScoreIcon className={cn('w-6 h-6', scoreIcon.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-base-50">{analysis.score}</span>
                <span className="text-sm text-base-400 font-mono">/ {analysis.maxScore}</span>
              </div>
              <p className="text-xs font-medium text-base-200">{analysis.label}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-3 h-1.5 rounded-full bg-base-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                analysis.score >= 70 ? 'bg-success-500' : analysis.score >= 50 ? 'bg-warning-500' : 'bg-danger-500'
              )}
              style={{ width: `${analysis.score}%` }}
            />
          </div>

          {/* Score breakdown toggle */}
          <button
            onClick={() => setShowScoreBreakdown((v) => !v)}
            className="w-full flex items-center gap-1 mt-2 text-2xs text-base-400 hover:text-base-200 transition-colors"
            aria-expanded={showScoreBreakdown}
          >
            {showScoreBreakdown ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Score breakdown
          </button>

          {showScoreBreakdown && (
            <div className="mt-2 flex flex-col gap-1.5">
              {analysis.scoreBreakdown.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.category];
                const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
                return (
                  <div key={cat.category} className="flex items-center gap-2">
                    <CatIcon className="w-3 h-3 text-base-400 flex-shrink-0" />
                    <span className="text-2xs text-base-300 w-24 flex-shrink-0 truncate">{cat.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-base-800 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          pct >= 70 ? 'bg-success-500' : pct >= 40 ? 'bg-warning-500' : 'bg-danger-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-2xs font-mono text-base-200 w-8 text-right flex-shrink-0">
                      {cat.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Critical issues */}
        {analysis.criticalIssues.length > 0 && (
          <FindingSection
            title="Critical Issues"
            findings={analysis.criticalIssues}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
            defaultExpanded
          />
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <FindingSection
            title="Warnings"
            findings={analysis.warnings}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
            defaultExpanded
          />
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <FindingSection
            title="Recommendations"
            findings={analysis.recommendations}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
            icon={<Lightbulb className="w-3 h-3" />}
          />
        )}

        {/* Bottlenecks */}
        {analysis.bottlenecks.length > 0 && (
          <FindingSection
            title="Potential Bottlenecks"
            findings={analysis.bottlenecks}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
            icon={<AlertOctagon className="w-3 h-3" />}
          />
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <FindingSection
            title="Strengths"
            findings={analysis.strengths}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
          />
        )}

        {/* Missing info */}
        {analysis.missingInfo.length > 0 && (
          <FindingSection
            title="Missing Information"
            findings={analysis.missingInfo}
            expandedFinding={expandedFinding}
            onToggle={toggleFinding}
          />
        )}

        {/* All findings list (compact) */}
        {sortedFindings.length > 0 && analysis.criticalIssues.length === 0 && analysis.warnings.length === 0 && (
          <div className="px-3 py-2">
            <p className="text-2xs text-base-400 text-center">
              {sortedFindings.length} finding{sortedFindings.length !== 1 ? 's' : ''} — no major issues detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FindingSection({
  title,
  findings,
  expandedFinding,
  onToggle,
  defaultExpanded = false,
  icon,
}: {
  title: string;
  findings: Finding[];
  expandedFinding: string | null;
  onToggle: (id: string) => void;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}) {
  const [sectionOpen, setSectionOpen] = useState(defaultExpanded);
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return findings.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [findings]);

  return (
    <div className="border-b border-base-700">
      <button
        onClick={() => setSectionOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-2xs font-semibold text-base-300 uppercase tracking-wide hover:text-base-100 transition-colors"
        aria-expanded={sectionOpen}
      >
        {sectionOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {icon}
        {title}
        <span className="ml-auto text-base-500 font-normal">{deduped.length}</span>
      </button>

      {sectionOpen && (
        <div className="px-3 pb-3 flex flex-col gap-1.5">
          {deduped.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              expanded={expandedFinding === finding.id}
              onToggle={() => onToggle(finding.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FindingCard({
  finding,
  expanded,
  onToggle,
}: {
  finding: Finding;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = SEVERITY_ICONS[finding.severity];
  const colors = SEVERITY_COLORS[finding.severity];

  return (
    <div
      className={cn('rounded-md border overflow-hidden', colors.bg, colors.border)}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-2 px-2.5 py-2 text-left"
        aria-expanded={expanded}
      >
        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', colors.icon)} />
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-medium leading-tight', colors.text)}>
            {finding.title}
          </p>
          {!expanded && (
            <p className="text-2xs text-base-400 mt-0.5 line-clamp-2 leading-relaxed">
              {finding.explanation}
            </p>
          )}
        </div>
        {finding.detail && (
          <span className="flex-shrink-0 mt-0.5">
            {expanded ? <ChevronDown className="w-3 h-3 text-base-400" /> : <ChevronRight className="w-3 h-3 text-base-400" />}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 pt-0">
          <p className="text-2xs text-base-300 leading-relaxed mb-2">{finding.explanation}</p>

          {finding.detail && (
            <div className="flex flex-col gap-2 mt-1.5">
              <DetailBlock label="What we detected" text={finding.detail.detected} />
              <DetailBlock label="Why it matters" text={finding.detail.whyItMatters} />
              <DetailBlock label="What you can do" text={finding.detail.whatYouCanDo} />
            </div>
          )}

          {finding.recommendation && !finding.detail && (
            <div className="flex items-start gap-1.5 mt-1.5 px-2 py-1.5 rounded bg-base-800/50">
              <Lightbulb className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-2xs text-base-200 leading-relaxed">{finding.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="px-2 py-1.5 rounded bg-base-800/50">
      <p className="text-2xs font-semibold text-base-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-2xs text-base-200 leading-relaxed">{text}</p>
    </div>
  );
}
