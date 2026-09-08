
export type Severity = 'info' | 'good' | 'warning' | 'critical';

export type AnalysisCategory =
  | 'network'
  | 'compute'
  | 'storage'
  | 'backup'
  | 'power'
  | 'reliability'
  | 'budget'
  | 'scalability'
  | 'data-completeness';

export type ComponentRole =
  | 'router'
  | 'switch'
  | 'compute'
  | 'storage'
  | 'backup'
  | 'power-protection'
  | 'access-point'
  | 'firewall'
  | 'other';

export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  category: AnalysisCategory;
  title: string;
  explanation: string;
  recommendation?: string;
  detail?: {
    detected: string;
    whyItMatters: string;
    whatYouCanDo: string;
  };
}

export interface ScoreCategory {
  category: AnalysisCategory;
  label: string;
  score: number;
  maxScore: number;
}

export interface ArchitectureAnalysis {
  score: number;
  maxScore: number;
  label: string;
  strengths: Finding[];
  warnings: Finding[];
  recommendations: Finding[];
  bottlenecks: Finding[];
  missingInfo: Finding[];
  criticalIssues: Finding[];
  allFindings: Finding[];
  scoreBreakdown: ScoreCategory[];
  isEmpty: boolean;
}

export interface RuleContext {
  components: import('@/types').ProjectComponent[];
  connections: import('@/types').Connection[];
  metrics: import('@/features/calculations/types').ProjectMetrics | null;
  roles: Map<string, ComponentRole>;
  componentRoles: { component: import('@/types').ProjectComponent; role: ComponentRole }[];
  isAdvanced: boolean;
}

export interface AnalysisRule {
  id: string;
  category: AnalysisCategory;
  evaluate: (ctx: RuleContext) => Finding[];
}

export const CATEGORY_SCORE_WEIGHTS: Record<AnalysisCategory, number> = {
  network: 15,
  compute: 10,
  storage: 10,
  backup: 15,
  power: 15,
  reliability: 15,
  budget: 10,
  scalability: 5,
  'data-completeness': 5,
};

export const CATEGORY_SCORE_LABELS: Record<AnalysisCategory, string> = {
  network: 'Network',
  compute: 'Compute',
  storage: 'Storage',
  backup: 'Backup',
  power: 'Power',
  reliability: 'Reliability',
  budget: 'Budget',
  scalability: 'Scalability',
  'data-completeness': 'Data Completeness',
};
