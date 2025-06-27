export type RuleType =
  | 'co-run'
  | 'slot-restriction'
  | 'load-limit'
  | 'pattern-match'
  | 'phase-window'
  | 'precedence';

export interface BusinessRule {
  id: string;
  type: RuleType;
  description: string;
  // Add other fields as needed for each rule type
}
