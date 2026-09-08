import type { Project } from '@/types';
import type { ProjectMetrics } from '@/features/calculations/types';
import type {
  Finding,
  ArchitectureAnalysis,
  ScoreCategory,
  AnalysisCategory,
  Severity,
} from './types';
import { CATEGORY_SCORE_WEIGHTS, CATEGORY_SCORE_LABELS } from './types';
import { detectComponentRoles } from './roleDetection';
import {
  analyzeNetwork,
  analyzeStorage,
  analyzePower,
  analyzeReliability,
  analyzeBudget,
  analyzeScalability,
  analyzeDataCompleteness,
} from './analysisRules';

function scoreLabel(score: number): string {
  if (score >= 85) return 'Strong architecture';
  if (score >= 70) return 'Good foundation';
  if (score >= 50) return 'More information needed';
  if (score >= 30) return 'Needs attention';
  return 'Start building to receive analysis';
}

function computeCategoryScore(
  category: AnalysisCategory,
  findings: Finding[]
): { score: number; maxScore: number } {
  const maxScore = CATEGORY_SCORE_WEIGHTS[category];
  const categoryFindings = findings.filter((f) => f.category === category);
  if (categoryFindings.length === 0) {
    return { score: Math.round(maxScore * 0.5), maxScore };
  }

  const goodCount = categoryFindings.filter((f) => f.severity === 'good').length;
  const warningCount = categoryFindings.filter((f) => f.severity === 'warning').length;
  const criticalCount = categoryFindings.filter((f) => f.severity === 'critical').length;
  const infoCount = categoryFindings.filter((f) => f.severity === 'info').length;

  if (criticalCount > 0) {
    return { score: Math.round(maxScore * 0.2), maxScore };
  }

  let scoreRatio = 0.6;
  scoreRatio += goodCount * 0.15;
  scoreRatio -= warningCount * 0.2;
  scoreRatio -= infoCount * 0.05;
  scoreRatio = Math.max(0.1, Math.min(1.0, scoreRatio));

  return { score: Math.round(maxScore * scoreRatio), maxScore };
}

export function analyzeArchitecture(
  project: Project,
  metrics: ProjectMetrics | null
): ArchitectureAnalysis {
  const { components, connections, experienceLevel } = project;
  const isAdvanced = experienceLevel === 'advanced';

  if (components.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      label: 'Start building to receive analysis',
      strengths: [],
      warnings: [],
      recommendations: [],
      bottlenecks: [],
      missingInfo: [],
      criticalIssues: [],
      allFindings: [],
      scoreBreakdown: [],
      isEmpty: true,
    };
  }

  const { roles, componentRoles } = detectComponentRoles(components);

  const ctx = {
    components,
    connections,
    metrics,
    roles,
    componentRoles,
    isAdvanced,
  };

  const allFindings: Finding[] = [
    ...analyzeNetwork(ctx),
    ...analyzeStorage(ctx),
    ...analyzePower(ctx),
    ...analyzeReliability(ctx),
    ...analyzeBudget(ctx),
    ...analyzeScalability(ctx),
    ...analyzeDataCompleteness(ctx),
  ];

  const categories: AnalysisCategory[] = [
    'network', 'compute', 'storage', 'backup', 'power',
    'reliability', 'budget', 'scalability', 'data-completeness',
  ];

  const scoreBreakdown: ScoreCategory[] = categories.map((cat) => {
    const { score, maxScore } = computeCategoryScore(cat, allFindings);
    return {
      category: cat,
      label: CATEGORY_SCORE_LABELS[cat],
      score,
      maxScore,
    };
  });

  const totalScore = scoreBreakdown.reduce((sum, s) => sum + s.score, 0);
  const clampedScore = Math.min(100, Math.max(0, totalScore));

  const strengths = allFindings.filter((f) => f.severity === 'good');
  const warnings = allFindings.filter((f) => f.severity === 'warning');
  const criticalIssues = allFindings.filter((f) => f.severity === 'critical');
  const recommendations = [...warnings, ...criticalIssues]
    .filter((f) => f.recommendation)
    .sort((a, b) => {
      const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2, good: 3 };
      return order[a.severity] - order[b.severity];
    });
  const bottlenecks = allFindings.filter((f) => f.ruleId === 'network-bottleneck' || f.ruleId === 'single-switch-spoF' || f.ruleId === 'single-compute');
  const missingInfo = allFindings.filter((f) => f.severity === 'info' && (f.category === 'data-completeness' || f.ruleId.includes('unknown')));

  return {
    score: clampedScore,
    maxScore: 100,
    label: scoreLabel(clampedScore),
    strengths,
    warnings,
    recommendations,
    bottlenecks,
    missingInfo,
    criticalIssues,
    allFindings,
    scoreBreakdown,
    isEmpty: false,
  };
}
