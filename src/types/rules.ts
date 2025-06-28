export interface BaseRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RuleType = 
  | 'co-run'
  | 'slot-restriction'
  | 'load-limit'
  | 'phase-window'
  | 'pattern-match'
  | 'precedence-override';

export interface CoRunRule extends BaseRule {
  type: 'co-run';
  taskIds: string[];
  mustRunTogether: boolean;
}

export interface SlotRestrictionRule extends BaseRule {
  type: 'slot-restriction';
  clientGroup: string[];
  workerGroup: string[];
  minCommonSlots: number;
}

export interface LoadLimitRule extends BaseRule {
  type: 'load-limit';
  workerGroup: string[];
  maxSlotsPerPhase: number;
  phaseType?: 'morning' | 'afternoon' | 'evening' | 'all';
}

export interface PhaseWindowRule extends BaseRule {
  type: 'phase-window';
  taskId: string;
  allowedPhases: string[];
  phaseRange?: {
    start: number;
    end: number;
  };
}

export interface PatternMatchRule extends BaseRule {
  type: 'pattern-match';
  regex: string;
  ruleTemplate: string;
  targetField: 'client' | 'worker' | 'task';
  action: 'include' | 'exclude' | 'prioritize';
}

export interface PrecedenceOverrideRule extends BaseRule {
  type: 'precedence-override';
  priorityOrder: string[];
  criteria: PrecedenceCriteria[];
}

export interface PrecedenceCriteria {
  field: string;
  weight: number;
  direction: 'asc' | 'desc';
}

export type BusinessRule = 
  | CoRunRule
  | SlotRestrictionRule
  | LoadLimitRule
  | PhaseWindowRule
  | PatternMatchRule
  | PrecedenceOverrideRule;

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  template: Partial<BusinessRule>;
  category: string;
}

export interface PrioritizationSettings {
  id: string;
  name: string;
  description: string;
  weights: {
    fulfillment: number;
    fairness: number;
    efficiency: number;
    cost: number;
    quality: number;
  };
  criteria: PrioritizationCriteria[];
  preset?: string;
}

export interface PrioritizationCriteria {
  field: string;
  weight: number;
  direction: 'asc' | 'desc';
  description: string;
}

export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NaturalLanguageRule {
  description: string;
  parsedRule?: BusinessRule;
  validation: RuleValidationResult;
  confidence: number;
}
